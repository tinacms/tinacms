const Wysiwyg = require('@tinacms/fields').Wysiwyg
const validateMdx = require('./index').validateMdx

exports.onClientEntry = () => {
  // tinacms is undifined ¯\_(ツ)_/¯
  window.tinacms.fields.add({
    name: 'mdxEditor',
    Component: Wysiwyg,
    validate: validateMdx,
  })
}
