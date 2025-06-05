import { Box } from "@mui/material";
import React, { memo } from "react";

import { cn } from "@/utils";


const colors = {
  blue: ["#006da3", "#0077b2", "#0689ca"],
  red: ["#a30000", "#b20000", "#ca0606"],
  green: ["#007a33", "#008c3a", "#00a347"],
  orange: ["#d95f02", "#e67e22", "#f39c12"],
  pink: ["#c2185b", "#d81b60", "#e91e63"],
  teal: ["#008080", "#009999", "#00b3b3"],
  yellow: ["#e6b800", "#ffcc00", "#ffd633"],
  purple: ["#6a0dad", "#7b1fa2", "#8e24aa"],
  cyan: ["#00bcd4", "#26c6da", "#4dd0e1"],
  lime: ["#9acd32", "#aedd39", "#c0f050"],
  brown: ["#5d4037", "#6d4c41", "#795548"],
  gray: ["#616161", "#757575", "#9e9e9e"],
} as const;


export type StyleProps = {
  bg?: string;
  sdc?: string;
  lbg?: string;
  fbg?: string;
  plbg?: string;
  pbbg?: string;
};

export type EnvelopeProps = {
  s?: string;
  cn?: string;
  style?: StyleProps;
  oe?: "hover" | "click" | "focus";
  ocec?: () => unknown;
  cs?: keyof typeof colors;
  readonly children?: React.ReactNode;
};

const Envelope = (p: EnvelopeProps) => {
  const cs = colors[p.cs ?? "blue"] ?? colors.blue;

  return (
    <Box
      className={cn("envelope-wrap", p.cn)}
      onClick={() => {
        if(p.oe === "click")
          return;

        p.ocec?.();
      }}
      sx={{
        position: "relative",
        width: p.s ? `calc(${p.s} * 1.6428)` : "280px",
        height: p.s ?? "180px",
        borderBottomLeftRadius: "9px",
        borderBottomRightRadius: "9px",
        backgroundColor: p.style?.bg ?? "var(--box-bg)",
        boxShadow: `0 4px 20px ${p.style?.sdc ?? "rgba(0, 0, 0, .5)"}`,
        perspective: p.s ? `calc(${p.s} * 3.889)` : "700px",
        transformStyle: "preserve-3d",
        cursor: "pointer",

        "& > .front": {
          position: "absolute",
          width: 0,
          height: 0,
          zIndex: "+50",
          borderRadius: "inherit",

          "&.flap": {
            borderTop: `${p.s ? ("calc(" + p.s + " * .54)") : "98px"} solid ${p.style?.fbg ?? cs[0]}`,
            borderLeft: `${p.s ? ("calc(" + p.s + " * .778)") : "140px"} solid transparent`,
            borderRight: `${p.s ? ("calc(" + p.s + " * .778)") : "140px"} solid transparent`,
            borderBottom: `${p.s ? ("calc(" + p.s + " * .45)") : "82px"} solid transparent`,
            transformOrigin: "top",
            transition: "1s ease",
          },

          "&.pocket": {
            borderTop: `${p.s ? ("calc(" + p.s + " * .5)") : "90px"} solid transparent`,
            borderLeft: `${p.s ? ("calc(" + p.s + " * .778)") : "140px"} solid ${p.style?.plbg ?? cs[1]}`,
            borderRight: `${p.s ? ("calc(" + p.s + " * .778)") : "140px"} solid ${p.style?.plbg ?? cs[1]}`,
            borderBottom: `${p.s ? ("calc(" + p.s + " * .5)") : "90px"} solid ${p.style?.pbbg ?? cs[2]}`,
          },
        },

        "& > .letter": {
          position: "relative",
          backgroundColor: p.style?.lbg ?? "#fefeff",
          width: "95%",
          height: "95%",
          margin: "auto",
          top: "5%",
          borderRadius: "6px",
          boxShadow: "0 2px 26px rgba(0, 0, 0, .12)",
          padding: ".5rem .55rem",
          overflow: "auto",

          "&::after": {
            content: "\"\"",
            inset: 0,
            backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0) 25%, rgba(215, 227, 239, 0.2) 60%, rgba(215, 227, 239, 0.3) 100%)",
          },
        },

        ...(!p.oe || p.oe === "hover" ? {
          "&:hover": {
            "& > .flap": {
              transform: "rotateX(180deg)",
              transition: "1s ease",
              zIndex: -1,
            },

            "& > .letter": {
              top: "-140px",
              transition: "1s 1s ease",
            },
          },
        } : {}),
      }}
    >
      <div className="front flap"></div>
      <div className="front pocket"></div>
      <div className="letter">
        {p.children}
      </div>
    </Box>
  );
};

export default memo(Envelope);
