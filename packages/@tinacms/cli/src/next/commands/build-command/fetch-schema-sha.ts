const FAQ_LINK = 'https://tina.io/docs/r/FAQ/';

export const fetchSchemaSha = async ({
  url,
  token,
}: {
  url: string;
  token?: string;
}) => {
  const headers = new Headers();
  if (token) {
    headers.append('X-API-KEY', token);
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-cache',
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }

  if (data?.errors?.length) {
    const messages = data.errors.map((error) =>
      typeof error?.message === 'string' ? error.message : JSON.stringify(error)
    );
    const statusInfo = res.ok
      ? ''
      : ` (status code ${res.status}, ${res.statusText})`;
    throw new Error(
      `The remote Tina schema API returned an error${statusInfo}: ${messages.join(
        '\n'
      )}`
    );
  }

  if (!res.ok) {
    let message = `Failed to fetch the remote Tina schema. Server responded with status code ${res.status}, ${res.statusText}.`;
    if (res.status === 401 || res.status === 403) {
      message += ` Please check that your client ID, URL and read only token are configured properly.`;
    }
    if (data?.message) {
      message += `\n\nMessage from server: ${data.message}`;
    }
    throw new Error(`${message}\n\nSee ${FAQ_LINK} for more information.`);
  }

  if (!data) {
    throw new Error(
      `The remote Tina schema API returned a response that could not be parsed as JSON (status code ${res.status}, ${res.statusText}).`
    );
  }

  return data;
};
