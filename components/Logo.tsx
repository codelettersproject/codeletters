import { Box } from "@mui/material";
import React, { memo } from "react";

import { Typography } from "./modular";


export type StyleProps = {
  width?: string;
};

export type LogoProps = {
  style?: StyleProps;
};

const Logo = (p: LogoProps) => {
  return (
    <Box
      sx={{
        width: p.style?.width ?? "fit-content",

        "& > span": {
          display: "inline-block",
          fontWeight: 700,
          letterSpacing: "0 !important",
          fontSize: "1.75rem",

          "&:first-of-type": {
            textTransform: "uppercase",
            color: "var(--theme-color)",
          },

          "&:last-of-type": {
            color: "var(--text-color)",
            marginLeft: "0.5rem",
            textTransform: "capitalize",
          },
        },
      }}
    >
      <Typography.Title>code</Typography.Title>
      <Typography.Title className="font-jet-mono">letters</Typography.Title>
    </Box>
  );
};

export default memo(Logo);
