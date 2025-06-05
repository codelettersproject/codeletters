import { Box, type SxProps } from "@mui/material";
import React, { InputHTMLAttributes, memo } from "react";

import Icon, { type IconProps } from "./Icon";


export interface SearchBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  width?: string;
  height?: string;
  borderRadius?: string;
  fontWeight?: string | number;
  placeholder?: string;
  icon?: IconProps["icon"];
  fontSize?: string;
  letterSpacing?: string;
  onUpdate?: (value: string) => void;
  sx?: SxProps;
}

const SearchBox = ({
  width,
  height,
  icon,
  fontSize,
  fontWeight,
  borderRadius,
  letterSpacing,
  onUpdate,
  sx,
  ...props
}: SearchBoxProps) => {
  return (
    <Box
      sx={{
        ...sx,
        width: width,
        height: height,
        borderRadius: borderRadius ?? "4.2px",
        position: "relative",

        "& > input": {
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          border: "1px solid transparent",
          outline: "none",
          padding: "0 .8rem",
          paddingRight: "2.4rem",
          fontSize: fontSize || ".9rem",
          fontWeight: fontWeight ?? "normal",
          letterSpacing: letterSpacing || "var(--default-letter-spacing)",
          color: "var(--text-color)",
          backgroundColor: "var(--box-bg)",

          "&:hover, &:focus": {
            borderColor: "var(--border-color)",
          },
        },

        "& > .icon": {
          fontSize: "20px",
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          borderTopRightRadius: borderRadius ?? "4.2px",
          borderBottomRightRadius: borderRadius ?? "4.2px",
          pointerEvents: "none",
          color: "var(--text-secondary)",
        },
      }}
    >
      <input
        {...props}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck="false"
        onChange={e => {
          onUpdate?.(e.target.value);
          props.onChange?.(e);
        }}
      />
      <Icon icon={icon ?? "search"} />
    </Box>
  );
};

export default memo(SearchBox);
