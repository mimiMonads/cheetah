export class Exception {
  public response

  constructor(
    error:
      | 'Not Found'
      | 'Access Denied'
      | 'Something Went Wrong'
      | 'Bad Request'
      | 'Payload Too Large'
      | 'Too Many Requests'
      | 404
      | 403
      | 500
      | 400
      | 413
      | 429
  ) {
    const message = typeof error === 'string'
      ? error
      : error === 404
      ? 'Not Found'
      : error === 400
      ? 'Bad Request'
      : error === 403
      ? 'Access Denied'
      : error === 413
      ? 'Payload Too Large'
      : error === 429
      ? 'Too Many Requests'
      : 'Something Went Wrong'

    const code = typeof error === 'number'
      ? error
      : error === 'Access Denied'
      ? 403
      : error === 'Bad Request'
      ? 400
      : error === 'Not Found'
      ? 404
      : error === 'Payload Too Large'
      ? 413
      : error === 'Too Many Requests'
      ? 429
      : 500

    const body = JSON.stringify({
      message,
      code
    })

    this.response = new Response(
      body,
      {
        headers: {
          'content-length': body.length.toString(),
          'content-type': 'application/json; charset=utf-8;'
        },
        status: code
      }
    )
  }
}