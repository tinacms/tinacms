import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Wysiwyg } from '@tinacms/fields'
import styled from 'styled-components'

export const Markdown = wrapFieldsWithMeta(styled(Wysiwyg)``)
