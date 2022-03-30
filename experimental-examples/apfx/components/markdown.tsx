import { TinaMarkdown, Components } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text'

export const Markdown = (props: {
  variant?: 'standard' | 'small'
  colorVariant?: 'dark' | 'light'
  classNames?: string
  className?: string
  children: TinaMarkdownContent
}) => {
  const variant = props.variant || 'standard'
  const colorVariant = props.colorVariant || 'light'
  const selectedVariant = variants[variant](colorVariant)
  return (
    <div
      className={`${selectedVariant.root} ${props.classNames} ${props.className}`}
    >
      <TinaMarkdown components={selectedVariant} content={props.children} />
    </div>
  )
}

type Variant = Components<{}> & {
  root: string
}

const standard: (colorVariant: 'light' | 'dark') => Variant = (
  colorVariant
): { root: string } & Components<{}> => {
  const headingColor = {
    light: 'text-white',
    dark: 'text-gray-800',
  }
  const bodyColor = {
    light: 'text-indigo-50',
    dark: 'text-gray-700',
  }
  return {
    root: 'text-white',
    h1: (props) => (
      <h1
        className={`${headingColor[colorVariant]} text-3xl md:text-5xl font-display font-bold`}
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className={`${headingColor[colorVariant]} text-2xl md:text-4xl font-display font-bold`}
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className={`${headingColor[colorVariant]} text-xl md:text-3xl font-display font-bold`}
        {...props}
      />
    ),
    h4: (props) => (
      <h4
        className={`${headingColor[colorVariant]} text-lg md:text-2xl font-display font-bold`}
        {...props}
      />
    ),
    h5: (props) => (
      <h5
        className={`${headingColor[colorVariant]} text-base md:text-xl font-display font-bold`}
        {...props}
      />
    ),
    h6: (props) => (
      <h6
        className={`${headingColor[colorVariant]} text-base md:text-lg font-display font-bold`}
        {...props}
      />
    ),
    p: (props) => (
      <p className={`${bodyColor[colorVariant]} mb-4`} {...props} />
    ),
    a: (props) => (
      <a href={props.url} className={`${bodyColor[colorVariant]}`} {...props} />
    ),
  }
}
const small: (colorVariant: 'light' | 'dark') => Variant = (
  colorVariant
): { root: string } & Components<{}> => {
  const headingColor = {
    light: 'text-white',
    dark: 'text-gray-800',
  }
  const bodyColor = {
    light: 'text-indigo-50',
    dark: 'text-gray-700',
  }
  return {
    root: 'text-white',
    h1: (props) => (
      <h1
        className={`${headingColor[colorVariant]} text-xl font-display font-bold`}
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className={`${headingColor[colorVariant]} text-lg font-display font-bold`}
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className={`${headingColor[colorVariant]} text-base font-display font-bold`}
        {...props}
      />
    ),
    h4: (props) => (
      <h4
        className={`${headingColor[colorVariant]} text-sm font-display font-bold`}
        {...props}
      />
    ),
    h5: (props) => (
      <h5
        className={`${headingColor[colorVariant]} text-xs font-display font-bold`}
        {...props}
      />
    ),
    h6: (props) => (
      <h6
        className={`${headingColor[colorVariant]} text-xs font-display font-bold`}
        {...props}
      />
    ),
    p: (props) => (
      <p className={`${bodyColor[colorVariant]} text-xs`} {...props} />
    ),
    a: (props) => (
      <a
        href={props.url}
        className={`${bodyColor[colorVariant]} text-xs`}
        {...props}
      />
    ),
  }
}

const variants = { standard, small }
