export default function remarkParse(options) {
  const parser = (doc, other) => {
    // Assume options.
    console.log(other)
    return doc
  }

  Object.assign(this, { Parser: parser })
}
