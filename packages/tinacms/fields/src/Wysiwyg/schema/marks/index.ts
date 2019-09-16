import code from '../../plugins/marks/code'
import em from '../../plugins/marks/em'
import link from '../../plugins/marks/link'
import strong from '../../plugins/marks/strong'

let PLUGINS = [code, em, link, strong]

/**
 * buildMarks
 */
export interface MarksOptions {
  [key: string]: boolean
}

export function buildMarks(options: MarksOptions = {}) {
  let _marks: any = {}

  PLUGINS.forEach(plugin => {
    if (options[plugin.name]) {
      _marks[plugin.name] = plugin.mark
    }
  })

  return _marks
}
