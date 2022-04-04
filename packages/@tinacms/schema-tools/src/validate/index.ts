import { TinaCloudSchema } from '../types'
import { TinaCloudSchemaZod } from './schema'
export const validateSchema = ({
  config,
}: {
  config: TinaCloudSchema<false>
}) => {
  TinaCloudSchemaZod.parse(config)
}
