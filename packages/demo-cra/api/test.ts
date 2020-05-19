export default (req: any, res: any) => {
  res.json({ title: 'This value loaded asynchronously' })
}
