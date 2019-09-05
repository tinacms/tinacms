export function api(req: any, res: any) {
  console.log(req.query)
  res.json(req.query)
}
