export class ReqStub {
  body: string
  headers = {}
  cookies = {}
  constructor(body: any = {}) {
    this.body = JSON.stringify(body)
  }
}

export class ResStub {
  status = jest.fn(() => this)
  json = jest.fn()
}
