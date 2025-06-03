import { Box, type SxProps } from "@mui/material";
import React, { HTMLAttributes, memo } from "react";

import { cn } from "@/utils";


export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "lg" | "sx" | "full" | "super-small";
  sx?: SxProps;
  spacing?: "none" | {
    top?: "none" | Omit<string, "none">;
    bottom?: "none" | Omit<string, "none">;
  };
  readonly children?: React.ReactNode;
  allowTextSelection?: boolean | "all";
  fullHeight?: boolean;
}

const Container = ({
  size,
  sx,
  children,
  spacing,
  fullHeight,
  allowTextSelection,
  ...props
}: ContainerProps) => {
  const MAX_WIDTHS = {
    sx: "1024px",
    lg: "var(--content-max-width)",
    "super-small": "680px",
    full: undefined,
  } as const;

  return (
    <Box
      {...props}
      className={cn("container-root", "container", `container__${size || "lg"}`, props.className)}
      sx={{
        width: "100%",
        maxWidth: MAX_WIDTHS[size || "lg"],
        height: fullHeight ? "100%" : undefined,
        margin: spacing === "none" || spacing?.top === "none" ? "0 auto" : `${spacing?.top || "2em"} auto 0`,
        paddingBottom: spacing === "none" || spacing?.bottom === "none" ? undefined : spacing?.bottom || "3em", 

        "& > div": {
          width: "100%",
          height: "fit-content",
          position: "relative",

          ...(allowTextSelection ? ({
            "&, & > *, & > * *": {
              userSelect: allowTextSelection === "all" ? "all" : "text",
            },
          }) : {}),
        },
      } as any}
    >
      <Box sx={sx}>
        {children}
      </Box>
    </Box>
  );
};

export default memo(Container);
