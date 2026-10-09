import type { TinaCMS } from '@tinacms/toolkit';
import React from 'react';

const TROUBLESHOOTING_URL = 'https://tina.io/docs/tinacloud/troubleshooting';

const TroubleshootingLink = () => (
  <a href={TROUBLESHOOTING_URL} target='_blank' rel='noopener noreferrer'>
    Read the TinaCloud troubleshooting guide
  </a>
);

export const ErrorDialog = (props: {
  /** @deprecated Pass the title to `cms.alerts.error` so it shows in the modal header. */
  title?: string;
  message: string;
  error: Error;
}) => (
  <>
    {props.title && <h3>{props.title}</h3>}
    <p>{props.message}:</p>
    <pre className='overflow-x-auto'>{`${props.error}`}</pre>
    <TroubleshootingLink />
  </>
);

export const showErrorModal = (
  title: string,
  message: string,
  cms: TinaCMS
) => {
  if (cms.alerts.all.some((a) => a.level === 'error')) return;
  cms.alerts.error(
    () => (
      <>
        <p>{message}</p>
        <TroubleshootingLink />
      </>
    ),
    { title }
  );
};
