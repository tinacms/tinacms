---
'@tinacms/schema-tools': patch
---

Deprecate and reconfigure internal types. Most user-facing types should remain unchanged aside from a couple of bug fixes:

- Fix missing `indexed` and `indexes` properties on `collection` and `field` configs.

Deprecations

```
CollectionFieldsWithNamespace
CollectionTemplates
CollectionTemplatesWithNamespace
GlobalTemplate
ObjectType
ReferenceType
ReferenceTypeInner
ReferenceTypeWithNamespace
RichTextType
RichTypeWithNamespace
TinaCloudCollection
TinaCloudCollectionBase
TinaCloudCollectionEnriched
TinaCloudSchema
TinaCloudSchemaBase
TinaCloudSchemaConfig
TinaCloudSchemaEnriched
TinaCloudSchemaWithNamespace
TinaCloudTemplateBase
TinaCloudTemplateEnriched
TinaFieldBase
TinaFieldEnriched
TinaFieldInner
TinaTemplate
```

Removals

```
Templatable
TinaIndex
ResolveFormArgs
```
