import React, { memo } from "react";
import { Box, type SxProps } from "@mui/material";

import Icon from "./Icon";


export type LoaderProps = {
  active?: boolean;
  color?: string;
  bg?: string;
  sx?: SxProps;
  fill?: boolean;
}

const Loader = (props: LoaderProps) => {
  return (
    <Box
      className="loader"
      sx={{
        ...props.sx,
        width: "100%",
        height: props.fill ? "100%" : (props.sx as unknown as any)?.height ?? "100svh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
        ...(() => {
          if(!props.bg || typeof props.bg !== "string") return {};
          return {
            backgroundColor: props.bg,
          };
        })(),

        "& > .icon": {
          fontSize: (props.sx as unknown as any)?.fontSize ?? "42px",
          color: props.color ?? "var(--text-color)",
        },
      }}
    >
      <Icon icon="bx-loader" className={props.active ? "bx-spin" : ""} />
    </Box>
  );
};

export default memo(Loader);
