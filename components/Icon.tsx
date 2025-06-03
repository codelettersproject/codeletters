import type { Dict } from "typesdk/types";
import { Box, type SxProps } from "@mui/material";
import React, { HTMLAttributes, forwardRef, memo } from "react";

import { cn } from "@/utils/react";


const DEFAULT_SX: Dict<SxProps> = {
  boxicons: {
    fontFamily: "boxicons !important",
    fontWeight: 400,
    fontStyle: "normal",
    fontFeatureSettings: "normal",
    fontVariant: "normal",
    lineHeight: 1,
    textRendering: "auto",
    display: "inline-block",
    textTransform: "none",
    speak: "none",
    WebkitFontSmoothing: "antialiased",
  },
  "fonts.google": {
    fontFamily: "\"Material Symbols Outlined\" !important",
    fontWeight: "normal",
    fontStyle: "normal",
    fontSize: "24px",
    lineHeight: 1,
    letterSpacing: "normal",
    textTransform: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    wordWrap: "normal",
    direction: "ltr",
    WebkitFontFeatureSettings: "\"liga\"",
    WebkitFontSmoothing: "antialiased",
  },
};

const UNICODE_SET = {
  // google fonts icons
  "arrow-back": "\"\\e5c4\"",
  "unfold-more": "\"\\e5d7\"",
  home: "\"\\e88a\"",
  stories: "\"\\e595\"",
  person: "\"\\e7fd\"",
  "add-box": "\"\\e146\"",
  settings: "\"\\e8b8\"",
  logout: "\"\\e9ba\"",
  "code-folder": "\"\\f3c8\"",
  "chevron-down": "\"\\e313\"",
  "chevron-up": "\"\\eae6\"",
  restart: "\"\\e042\"",
  abc: "\"\\eb94\"",
  html: "\"\\eb7e\"",
  heart: "\"\\e87d\"",
  "broken-heart": "\"\\eac2\"",
  shapes: "\"\\e7c8\"",
  flag: "\"\\e153\"",
  "pin-block": "\"\\e55e\"",
  "thumb-up": "\"\\e8dc\"",
  globe: "\"\\e80b\"",
  "rocket-launch": "\"\\eb9b\"",
  medal: "\"\\e7af\"",
  pets: "\"\\e91d\"",
  "water-drop": "\"\\e798\"",
  book: "\"\\ea19\"",
};

const UNICODE_ICON_ALIAS = {};



export interface IconProps extends HTMLAttributes<HTMLElement> {
  provider?: "boxicons" | "fonts.google";
  icon?: keyof typeof UNICODE_SET | keyof typeof UNICODE_ICON_ALIAS;
}


/* eslint-disable-next-line react/display-name */
const Icon = forwardRef<HTMLElement, IconProps>(({ provider, icon, className, color, ...props }: IconProps, ref) => {
  const i: string = (icon ?
    Object.keys(UNICODE_ICON_ALIAS).includes(icon as string)
      ? (UNICODE_ICON_ALIAS as Dict<string>)[icon]
      : icon
    : "bx-error") as unknown as string;

  const p = provider && ["boxicons", "fonts.google"].includes(provider) ?
    provider :
    (
      i.startsWith("bx-") ||
      i.startsWith("bxs-")
    ) ?
      "boxicons" :
      "fonts.google";

  return (
    <Box
      { ...props }
      component="i"
      role={props.role ?? "icon"}
      ref={ref}
      className={cn("icon", "drawer-ui-icon-element", className)}
      sx={Object.assign({}, {
        "&::before": {
          content: UNICODE_SET[i as unknown as keyof typeof UNICODE_SET],
        },

        color,
      }, DEFAULT_SX[p])}
    />
  );
});

export default memo(Icon);
