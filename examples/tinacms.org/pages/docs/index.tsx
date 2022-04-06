import DocTemplate from './[...slug]'
import { getDocProps } from 'utils/docs/getDocProps'
import { GetStaticProps } from 'next'

export const getStaticProps: GetStaticProps = async function (props) {
  return await getDocProps(props, 'index')
}

export default DocTemplate
