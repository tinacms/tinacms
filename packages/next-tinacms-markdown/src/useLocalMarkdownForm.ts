import { usePlugins } from 'tinacms'
import { useMarkdownForm, MarkdownFile, Options } from './useMarkdownForm'

/**
 * Registers a Local Form with TinaCMS for editing a Markdown File.
 */
export function useLocalMarkdownForm(
  markdownFile: MarkdownFile,
  options?: Options
) {
  const [values, form] = useMarkdownForm(markdownFile, options)
  usePlugins(form)

  return [values, form]
}