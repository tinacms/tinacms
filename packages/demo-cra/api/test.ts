import { NowRequest, NowResponse } from '@now/node'

export default (req: NowRequest, res: NowResponse) => {
  res.json({ title: 'This value loaded asynchronously' })
}
