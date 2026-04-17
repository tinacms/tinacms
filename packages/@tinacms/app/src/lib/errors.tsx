import React from 'react';
import { TinaCMS } from 'tinacms';

const TROUBLESHOOTING_URL = 'https://tina.io/docs/tinacloud/troubleshooting';

const ErrorModalContent = (props: { title: string; message: string }) => {
  const { title, message } = props;
  return (
    <>
      <div>{title}</div>
      <p>{message}</p>
      <a href={TROUBLESHOOTING_URL} target='_blank' rel='noopener noreferrer'>
        Try these troubleshooting tips
      </a>
    </>
  );
};

export const showErrorModal = (
  title: string,
  message: string,
  cms: TinaCMS
) => {
  if (cms.alerts.all.some((a: { level: string }) => a.level === 'error'))
    return;
  cms.alerts.error(() => <ErrorModalContent title={title} message={message} />);
};
