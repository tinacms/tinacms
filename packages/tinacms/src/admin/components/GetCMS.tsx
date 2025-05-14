/**

*/

import { useCMS } from '@tinacms/toolkit';
import React from 'react';

const GetCMS = ({ children }: { children: any }) => {
  const cms = useCMS();
  try {
    return <>{children(cms)}</>;
  } catch (e) {
    return null;
  }
};

export default GetCMS;
