export default (_req, res) => {
  res.clearPreviewData()
  res.status(200).end()
}
