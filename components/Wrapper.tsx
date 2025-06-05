import Head from "next/head";
import { Box } from "@mui/material";
import { useDispatch } from "react-redux";
import React, { memo, useState } from "react";

import Icon from "./Icon";
import Loader from "./Loader";
import Button from "./Button";
import Sidebar from "./Sidebar";
import { useRender } from "@/hooks";
import { Typography } from "./modular";
import { useAuth } from "@/context/auth";
import { flexCenter } from "@/styles/theme";
import { cn, delayed, useIsMobile } from "@/utils";
import { setIsSidebarOpen, useAppState } from "@/redux/features/appState";


export type WrapperProps = {
  readonly children?: React.ReactNode;
  readonly m?: { dt?: string };
  hs?: boolean;
}

const Wrapper = (p: WrapperProps) => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const { isAuthenticated } = useAuth();
  const { isSidebarOpen } = useAppState();

  const [state, setState] = useState({
    isMounted: false,
  });

  useRender(async () => {
    const isAuth = await isAuthenticated();

    if(!isAuth) {
      window.location.href = `/ServiceAuth/0/login?continue=${encodeURIComponent(window.location.href)}`;
      return;
    }

    delayed(() => setState(prev => ({ ...prev, isMounted: true })), 375);
  });

  if(!state.isMounted) return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        ...flexCenter,

        "& > .loader .icon": {
          fontSize: "22px",
          fontWeight: 300,
          color: "var(--theme-color)",
        },
      }}
    >
      <Loader active={!state.isMounted} fill />
    </Box>
  );

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
              onClick={() => {
                dispatch(setIsSidebarOpen(!isSidebarOpen));
              }}
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
              <Icon icon={`menu-${isSidebarOpen ? "close" : "open"}`} />
              <Typography.Text>Sidebar</Typography.Text>
            </Button>
          ) : null
        }
      </div>
    </>
  );
};

export default memo(Wrapper);
