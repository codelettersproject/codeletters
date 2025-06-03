import React, { memo } from 'react';

import Sidebar from './Sidebar';


export type WrapperProps = {
  readonly children?: React.ReactNode;
}

const Wrapper = (p: WrapperProps) => {
  return (
    <>
      <Sidebar />
      <div className="wrapper">
        {p.children}
      </div>
    </>
  );
};

export default memo(Wrapper);
