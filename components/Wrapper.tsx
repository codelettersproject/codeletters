import Head from "next/head";
import React, { memo } from "react";

import { cn } from "@/utils";
import Sidebar from "./Sidebar";


export type WrapperProps = {
  readonly children?: React.ReactNode;
  readonly m?: { dt?: string };
  hs?: boolean;
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
      {
        p.hs ? null : (
          <Sidebar />
        )
      }
      <div className={cn("wrapper", { ns: p.hs })}>
        {p.children}
      </div>
    </>
  );
};

export default memo(Wrapper);
