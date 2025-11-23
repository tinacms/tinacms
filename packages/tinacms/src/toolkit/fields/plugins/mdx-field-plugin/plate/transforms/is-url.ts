/**
 * RegExps. A URL must match #1 or #2 or #3 or #4.
 */

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const emailLintRE = /mailto:([^?\\]+)/;
const telLintRE = /tel:([\d-]+)/; // Added regex for tel: links
const localhostDomainRE = /^localhost[\d:?]*(?:[^\d:?]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;
const localUrlRE = /^\/\S+/; // Regular expression for local URLs

/** Loosely validate a URL `string`. */
export const isUrl = (string: any) => {
  if (typeof string !== 'string') {
    return false;
  }

  // Check if the string is a bare hash link
  if (string.startsWith('#')) {
    return true;
  }

  const generalMatch = string.match(protocolAndDomainRE);
  const emailLinkMatch = string.match(emailLintRE);
  const telLinkMatch = string.match(telLintRE); // Check for tel: link match
  const localUrlMatch = string.match(localUrlRE); // Check for local URL match

  // Check if any of the specific link types or the general pattern match
  if (emailLinkMatch || telLinkMatch || localUrlMatch) {
    // For tel and mailto, we can consider them valid if they match the specific regex.
    // For local URLs, the regex already covers it.
    return true;
  }

  // If none of the specific types matched, check the general URL pattern
  if (generalMatch) {
    const everythingAfterProtocol = generalMatch[1];
    if (!everythingAfterProtocol) {
      return false;
    }

    // Fallback to URL constructor for stricter validation of complex URLs
    try {
      new URL(string);
    } catch {
      return false;
    }

    // Validate the domain part for general URLs
    return (
      localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)
    );
  }

  return false;
};
