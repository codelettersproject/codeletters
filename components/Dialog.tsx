import { Box } from "@mui/material";
import React, { useRef, memo } from "react";

import { cn } from "@/utils/react";
import { useClickOutside } from "@/hooks";


export type DialogProps = {
  readonly children: React.ReactNode;
  onOverlayClick?: (() => void);
  background?: string;
  className?: string;
  maxWidth?: string;
  padding?: string;
  boxBg?: string;
  borderRadius?: string;
  height?: string;
  maxHeight?: string;
  open: boolean;
  border?: string;
  shadow?: string;
}

const Dialog = (props: DialogProps) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useClickOutside(boxRef, () => {
    if(props.open === true) {
      props.onOverlayClick?.();
    }
  });

  return (
    <Box
      className={cn("drawer-ui-dialog-component", props.className, { active: props.open })}
      role="presentation"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100svh",
        overflow: "hidden",
        backgroundColor: props.background ?? "rgba(0, 0, 0, 0.5)",
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9000,
        transition: "opacity 0.1s ease, transform .2s ease-in-out",

        ...(() => {
          if(!props.open) return {
            pointerEvents: "none",
            opacity: "0",
          };

          return {
            pointerEvents: "auto",
            opacity: "1",
          };
        })(),

        "& > div": {
          ...(() => {
            if(!props.open) return {
              pointerEvents: "none",
              transform: "scale(0)",
            };
  
            return {
              pointerEvents: "auto",
              transform: "scale(1)",
            };
          })(),
        },
      }}
    >
      <Box
        ref={boxRef}
        sx={{
          maxWidth: props.maxWidth ?? "400px",
          width: "100%",
          maxHeight: props.maxHeight,
          height: props.height,
          padding: props.padding ?? "20px",
          borderRadius: props.borderRadius ?? "4px",
          backgroundColor: props.boxBg ?? "var(--box-bg)",
          boxShadow: props.shadow || "0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)",
          transition: "opacity 0.045s ease, transform .2s ease-in-out",
          border: props.border || "1px solid var(--border-color)",
          margin: "20px",
          zIndex: 200,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default memo(Dialog);
