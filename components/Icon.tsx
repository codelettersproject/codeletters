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
  // box icons
  "bx-error": "\"\\eac5\"",
  "bx-bell": "\"\\e9d2\"",
  "bxs-bell": "\"\\ecc9\"",
  "bx-home": "\"\\eb12\"",
  "bx-id-card": "\"\\eb1a\"",
  "bx-face": "\"\\ead0\"",
  "bx-archive": "\"\\e9b0\"",
  "bx-log-out": "\"\\eb4f\"",
  "bx-chalkboard": "\"\\ea3e\"",
  "bx-user-circle": "\"\\ec65\"",
  "bx-ghost": "\"\\eaee\"",
  "bx-lock": "\"\\eb49\"",
  "bx-lock-alt": "\"\\eb4a\"",
  "bx-loader-alt": "\"\\eb46\"",
  "bx-menu": "\"\\eb5f\"",
  "box-focus": "\"\\e9fe\"",
  "bx-shape-square": "\"\\ec00\"",
  "bx-cog": "\"\\ea6e\"",
  "bx-arrow-back": "\"\\e9b4\"",
  "bx-chevron-left": "\"\\ea4d\"",
  "bx-plus": "\"\\ebc0\"",
  "bx-x": "\"\\ec8d\"",
  "bx-paint": "\"\\eba7\"",
  "bx-paint-roll": "\"\\eba8\"",
  "bx-loader": "\"\\eb45\"",
  "bx-plus-circle": "\"\\ebc1\"",
  "bx-chevron-right": "\"\\ea50\"",
  "bx-chevron-down": "\"\\ea4a\"",
  "bx-search": "\"\\ebf8\"",
  "bx-search-alt": "\"\\ebf9\"",
  "bx-file-blank": "\"\\ead6\"",
  "bx-chevron-up": "\"\\ea57\"",
  "bx-youtube": "\"\\e992\"",
  "bx-link": "\"\\eb3c\"",
  "bx-link-alt": "\"\\eb3d\"",
  "bx-key": "\"\\eb28\"",
  "bx-play-arrow": "\"\\ebbd\"",
  "bx-server": "\"\\ebfd\"",
  "bx-check": "\"\\ea41\"",
  "bx-paper-plane": "\"\\ebab\"",
  "bx-notepad": "\"\\eba2\"",
  "bx-trash": "\"\\ec51\"",
  "bx-trash-alt": "\"\\ec50\"",
  "bx-tv": "\"\\ec57\"",
  "bx-ig": "\"\\e942\"",
  "bx-ig-alt": "\"\\e943\"",
  "bx-github": "\"\\e93a\"",
  "bx-linkedin": "\"\\e94d\"",
  "bx-linkedin-square": "\"\\e94e\"",
  "bx-whatsapp": "\"\\e98a\"",
  "bx-twitter": "\"\\e982\"",

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
  save: "\"\\e161\"",
  close: "\"\\e5cd\"",
  info: "\"\\e88e\"",
  "playlist-check": "\"\\e065\"",
  eye: "\"\\e8f4\"",
  mood: "\"\\e7f2\"",
  "menu-close": "\"\\f3d3\"",
  "menu-open": "\"\\f3d2\"",
  share: "\"\\e80d\"",
  search: "\"\\e8b6\"",
  account: "\"\\e853\"",
  mail: "\"\\e158\"",
  password: "\"\\f042\"",
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
