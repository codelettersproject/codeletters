import Head from "next/head";
import React, { memo } from "react";

import Icon from "./Icon";
import Button from "./Button";
import Sidebar from "./Sidebar";
import { Typography } from "./modular";
import { cn, useIsMobile } from "@/utils";


export type WrapperProps = {
  readonly children?: React.ReactNode;
  readonly m?: { dt?: string };
  hs?: boolean;
}

const Wrapper = (p: WrapperProps) => {
  const isMobile = useIsMobile();

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
        {
          isMobile ? (
            <Button
              tabIndex={0}
              sx={{
                position: "absolute",
                top: "1.45rem",
                right: "1.85rem",
                padding: "0.35rem 1.05rem",
                borderRadius: "25px",
                cursor: "pointer",
                backgroundColor: "var(--theme-color)",
                color: "#fefeff",
                border: "1px solid transparent",
                outline: "none",
                zIndex: 420,
                transition: "background-color .09s ease-in-out, color .065s ease-in-out",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",

                "& > span": {
                  fontSize: "1rem",
                  fontWeight: 500,
                  paddingRight: "0.5rem",
                  letterSpacing: "calc(var(--default-letter-spacing) / 1.5)",
                },

                "&:active": {
                  borderColor: "var(--theme-color)",
                },

                "@media (hover: hover)": {
                  "&:hover": {
                    backgroundColor: "rgba(99, 102, 241, 0.21)",
                    color: "var(--theme-color)",
                  },
                },
              }}
            >
              <Icon icon="menu-open" />
              <Typography.Text>Sidebar</Typography.Text>
            </Button>
          ) : null
        }
      </div>
    </>
  );
};

export default memo(Wrapper);
