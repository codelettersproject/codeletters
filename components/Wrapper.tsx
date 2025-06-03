import React, { memo } from "react";

import Sidebar from "./Sidebar";
import Head from "next/head";


export type WrapperProps = {
  readonly children?: React.ReactNode;
  readonly m?: { dt?: string };
}

const Wrapper = (p: WrapperProps) => {
  return (
    <>
      <Head>
        {
          p.m?.dt ? (
            <title>{p.m.dt}</title>
          ) : null
        }
      </Head>
      <Sidebar />
      <div className="wrapper">
        {p.children}
      </div>
    </>
  );
};

export default memo(Wrapper);
