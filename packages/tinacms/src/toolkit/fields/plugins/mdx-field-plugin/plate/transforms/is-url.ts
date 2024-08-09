/**
 * RegExps. A URL must match #1 and then at least one of #2/#3. Use two levels
 * of REs to avoid REDOS.
 */

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/
const emailLintRE = /mailto:([^?\\]+)/
const localhostDomainRE = /^localhost[\d:?]*(?:[^\d:?]\S*)?$/
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/
const localUrlRE = /^\/\S+/ // Regular expression for local URLs

/** Loosely validate a URL `string`. */
export const isUrl = (string: any) => {
  if (typeof string !== 'string') {
    return false
  }

  const generalMatch = string.match(protocolAndDomainRE)
  const emailLinkMatch = string.match(emailLintRE)
  const localUrlMatch = string.match(localUrlRE) // Check for local URL match

  const match = generalMatch || emailLinkMatch || localUrlMatch

  if (!match) {
    return false
  }

  if (localUrlMatch) {
    return true // If it's a local URL, we can return true directly
  }

  const everythingAfterProtocol = match[1]

  if (!everythingAfterProtocol) {
    return false
  }

  try {
    new URL(string)
  } catch {
    return false
  }

  return (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  )
}
