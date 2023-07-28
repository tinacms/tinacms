import * as React from 'react'
import type { TinaCMS } from '@toolkit/tina-cms'
import { BiEdit } from 'react-icons/bi'

interface ReferenceLinkProps {
  cms: TinaCMS
  input: any
}

type Document = {
  _sys: {
    collection: {
      name: string
    }
    breadcrumbs: string[]
  }
}

interface Response {
  node: Document
}

const useGetNode = (cms: TinaCMS, id: string) => {
  const [document, setDocument] = React.useState<Document | undefined>(
    undefined
  )

  React.useEffect(() => {
    const fetchNode = async () => {
      const response: Response = await cms.api.tina.request(
        `#graphql
        query($id: String!) {
          node(id:$id) {
            ... on Document {
              _sys {
                collection {
                  name
                }
                breadcrumbs
              }
            }
          }
        }`,
        { variables: { id } }
      )

      setDocument(response.node)
    }
    if (cms && id) {
      fetchNode()
    } else {
      setDocument(undefined)
    }
  }, [cms, id])
  return document
}

const GetReference = ({ cms, id, children }) => {
  const document = useGetNode(cms, id)

  if (!document) {
    return null
  }
  return <>{children(document)}</>
}

const ReferenceLink: React.FC<ReferenceLinkProps> = ({ cms, input }) => {
  const hasTinaAdmin = cms.flags.get('tina-admin') === false ? false : true
  const tinaPreview = cms.flags.get('tina-preview') || false

  if (!hasTinaAdmin) {
    return null
  }

  return (
    <GetReference cms={cms} id={input.value}>
      {(document: Document) =>
        cms.state.editingMode === 'visual' ? (
          <button
            type="button"
            onClick={() => {
              cms.dispatch({
                type: 'forms:set-active-form-id',
                value: input.value,
              })
            }}
            className="text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"
          >
            <BiEdit className="h-5 w-auto opacity-80 mr-2" />
            Edit
          </button>
        ) : (
          <a
            href={`${
              tinaPreview ? `/${tinaPreview}/index.html#` : '/admin#'
            }/collections/${
              document._sys.collection.name
            }/${document._sys.breadcrumbs.join('/')}`}
            className="text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"
          >
            <BiEdit className="h-5 w-auto opacity-80 mr-2" />
            Edit in CMS
          </a>
        )
      }
    </GetReference>
  )
}

export default ReferenceLink
