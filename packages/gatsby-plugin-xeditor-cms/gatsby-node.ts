import { markdownRemarkServer } from './markdownRemark/server'

exports.onPreBootstrap = () => {
  markdownRemarkServer()
}
