import { assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts'
import cheetah from '../mod.ts'

Deno.test('preflight mode', async (t) => {
  await t.step('basic', async () => {
    const app = new cheetah({ preflight: true })

    app.get('/foo1', () => {
      return 'bar1'
    })

    app.post('/foo2', () => {
      return 'bar2'
    })

    const res1 = await app.fetch(new Request('https://deno.com/foo1'))

    assertEquals(res1.body === null, false)
    assertEquals(res1.headers.get('content-length'), '4')

    const res2 = await app.fetch(
      new Request('https://deno.com/foo1', { method: 'HEAD' }),
    )

    assertEquals(res2.body === null, true)
    assertEquals(res2.headers.get('content-length'), '4')

    const res3 = await app.fetch(
      new Request('https://deno.com/foo2', { method: 'POST' }),
    )

    assertEquals(res3.body === null, false)
    assertEquals(res3.headers.get('content-length'), '4')

    const res4 = await app.fetch(
      new Request('https://deno.com/foo2', { method: 'HEAD' }),
    )

    assertEquals(res4.status, 404)
    assertEquals(res4.body === null, true)
    assertEquals(
      res4.headers.get('content-length'),
      'Not Found'.length.toString(),
    )
  })

  await t.step('not found', async () => {
    const app = new cheetah({ preflight: true })

    const res1 = await app.fetch(new Request('https://deno.com/foo'))

    assertEquals(res1.body === null, false)
    assertEquals(
      res1.headers.get('content-length'),
      'Not Found'.length.toString(),
    )

    const res2 = await app.fetch(
      new Request('https://deno.com/foo', { method: 'HEAD' }),
    )

    assertEquals(res2.body === null, true)
    assertEquals(
      res2.headers.get('content-length'),
      'Not Found'.length.toString(),
    )
  })

  await t.step('not found (custom)', async () => {
    const app = new cheetah({
      preflight: true,
      notFound() {
        return new Response('custom', {
          headers: {
            foo: 'bar',
          },
        })
      },
    })

    const res1 = await app.fetch(new Request('https://deno.com'))

    assertEquals(res1.body === null, false)
    assertEquals(res1.headers.get('foo'), 'bar')

    const res2 = await app.fetch(
      new Request('https://deno.com', { method: 'HEAD' }),
    )

    assertEquals(res2.body === null, true)
    assertEquals(res2.headers.get('foo'), 'bar')
  })

  await t.step('error', async () => {
    const app = new cheetah({ preflight: true })

    app.get('/foo', () => {
      throw new Error()
    })

    const res1 = await app.fetch(new Request('https://deno.com/foo'))

    assertEquals(res1.body === null, false)
    assertEquals(
      res1.headers.get('content-length'),
      'Something Went Wrong'.length.toString(),
    )

    const res2 = await app.fetch(
      new Request('https://deno.com/foo', { method: 'HEAD' }),
    )

    assertEquals(res2.body === null, true)
    assertEquals(
      res2.headers.get('content-length'),
      'Something Went Wrong'.length.toString(),
    )
  })

  await t.step('error (custom)', async () => {
    const app = new cheetah({
      preflight: true,
      error() {
        return new Response('custom', {
          headers: {
            foo: 'bar',
          },
        })
      },
    })

    app.get('/foo', () => {
      throw new Error()
    })

    const res1 = await app.fetch(new Request('https://deno.com/foo'))

    assertEquals(res1.body === null, false)
    assertEquals(res1.headers.get('foo'), 'bar')

    const res2 = await app.fetch(
      new Request('https://deno.com/foo', { method: 'HEAD' }),
    )

    assertEquals(res2.body === null, true)
    assertEquals(res2.headers.get('foo'), 'bar')
  })
})
