
const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const emailLintRE = /mailto:([^?\\]+)/;
const telLintRE = /tel:([\d-]+)/;
const localhostDomainRE = /^localhost[\d:?]*(?:[^\d:?]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;
const localUrlRE = /^\/\S+/;

export const isUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.startsWith('#')) {
    return true;
  }

  const generalMatch = value.match(protocolAndDomainRE);
  const emailLinkMatch = value.match(emailLintRE);
  const telLinkMatch = value.match(telLintRE);
  const localUrlMatch = value.match(localUrlRE);

  if (emailLinkMatch || telLinkMatch || localUrlMatch) {
    return true;
  }

  if (generalMatch) {
    const everythingAfterProtocol = generalMatch[1];
    if (!everythingAfterProtocol) {
      return false;
    }

    try {
      new URL(value);
    } catch {
      return false;
    }

    return (
      localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)
    );
  }

  return false;
};
