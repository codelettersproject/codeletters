import React, { memo } from "react";
import { Box, type SxProps } from "@mui/material";

import { useIsMobile } from "@/utils";
import { flexCenter } from "@/styles/theme";


export type AuthLayoutProps = {
  readonly children?: React.ReactNode;
  sx?: SxProps;
};

const AuthLayout = (p: AuthLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 390,
        backgroundColor: isMobile ? "var(--box-bg)" : "var(--body-bg)",
        color: "var(--text-color)",
        ...flexCenter,

        "& > section": {
          maxWidth: "28rem",
          width: "100%",
          maxHeight: "90dvh",
          borderRadius: "4.5px",
          overflow: "auto",
          zIndex: 395,
          backgroundColor: "var(--box-bg)",
          padding: "1.05rem 1.3875rem",
          boxShadow: isMobile ? undefined : "var(--soft-shadow)",
          border: isMobile ? undefined : "1px solid var(--border-color)",
        },
      }}
    >
      <Box
        component="section"
        sx={p.sx}
      >
        {p.children}
      </Box>
    </Box>
  );
};

export default memo(AuthLayout);
