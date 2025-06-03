import type { Property } from "csstype";


export function clampLine(lines: number = 1, textOverflow: Property.TextOverflow = "ellipsis", hideBox: boolean = false) {
  if(typeof lines !== "number" || lines < 1) {
    lines = 1;
  }

  if(
    !["-moz-initial", "inherit", "initial", "revert", "revert-layer", "unset", "clip", "ellipsis"]
      .includes(textOverflow)
  ) {
    textOverflow = "ellipsis";
  }

  return {
    ...(hideBox ? {} : {
      display: "-webkit-box !important",
      WebkitBoxOrient: "vertical !important",
    }),
    overflow: "hidden !important",
    WebkitLineClamp: `${lines} !important`,
    textOverflow: `${textOverflow} !important`,
  } as const;
}


export const gridCenter = {
  display: "grid",
  placeItems: "center",
  alignContent: "space-around",
  justifyContent: "center",
  alignItems: "baseline",
  justifyItems: "center",
} as const;

export const flexCenter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;


export const presetStyles = {
  gradientBgImage: {
    dark: {
      backgroundImage: "linear-gradient(to top, var(--body-bg), rgba(0,0,0,0))",
    },
    light: {
      backgroundImage: "linear-gradient(to top, var(--body-bg), rgba(0,0,0,0))",
    },
  },
  horizontalGradientBgImage: {
    dark: {
      backgroundImage: "linear-gradient(to right, var(--body-bg), rgba(0,0,0,0))",
    },
    light: {
      backgroundImage: "linear-gradient(to right, var(--body-bg), rgba(0,0,0,0))",
    },
  },
} as const;
