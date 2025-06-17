import { useCMS } from '@toolkit/react-core';
import * as React from 'react';
import { BiError, BiRightArrowAlt } from 'react-icons/bi';
import { Alert } from './alert';

export const LocalWarning = () => {
  const cms = useCMS();
  const isLocalMode = cms.api?.tina?.isLocalMode;

  if (!isLocalMode) {
    return null;
  }

  return (
    <Alert alertStyle='warning'>
      <a href='https://tina.io/docs/tina-cloud/' target='_blank'>
        You are in local mode
      </a>
    </Alert>
  );
};

export const BillingWarning = () => {
  const cms = useCMS();
  const api = cms?.api?.tina;
  const isCustomContentApi: boolean = api?.isCustomContentApi || false;

  const [billingState, setBillingState] = React.useState(
    null as {
      clientId: string;
      delinquencyDate: number;
      billingState: 'current' | 'late' | 'delinquent';
    } | null
  );

  React.useEffect(() => {
    const fetchBillingState = async () => {
      if (typeof api?.getBillingState !== 'function') return;
      const billingRes = await api?.getBillingState();
      setBillingState(billingRes);
    };
    if (!cms.api?.tina?.isLocalMode && !isCustomContentApi) fetchBillingState();
  }, []);

  if (
    isCustomContentApi ||
    !billingState ||
    billingState.billingState === 'current'
  ) {
    return <></>;
  }

  return (
    <div className='flex-grow-0 flex flex-wrap w-full text-xs items-center justify-between gap-1.5 py-1.5 px-3 text-red-700 bg-gradient-to-br from-white via-red-50 to-red-100 border-b border-red-200'>
      <span className='flex items-center gap-1 font-bold'>
        <BiError className='w-5 h-auto flex-shrink-0 flex-grow-0 inline-block opacity-70 text-red-600' />
        <span className='flex whitespace-nowrap'>
          There is an issue with your billing.
        </span>
      </span>
      <a
        className='text-xs text-blue-600 underline decoration-blue-200 hover:text-blue-500 hover:decoration-blue-500 transition-all ease-out duration-150 flex items-center gap-1 self-end'
        href={`https://app.tina.io/projects/${billingState.clientId}/billing`}
        target='_blank'
      >
        Visit Billing Page
        <BiRightArrowAlt className='w-5 h-full opacity-70' />
      </a>
    </div>
  );
};
