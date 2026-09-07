import { definePlugin } from '../../../core/plugin';
import { REFERENCE_FIELD_TYPE } from './reference-field.schema';

const referenceFieldPlugin = definePlugin({
    name: 'tina:field:reference',
    provides: ['field'],
    field: { type: REFERENCE_FIELD_TYPE, contractVersion: 1 },
    client: () => import('./reference-field.client')
})

export default referenceFieldPlugin