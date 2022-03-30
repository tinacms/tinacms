import Page, {
  getStaticProps as baseGetStaticProps,
} from '../components/blocks'

export default Page

export const getStaticProps = () => {
  return baseGetStaticProps({ relativePath: 'dummy.md' })
}
