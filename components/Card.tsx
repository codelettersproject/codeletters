import { Box } from "@mui/material";
import React, { memo } from "react";

import Icon from "./Icon";
import { cn } from "@/utils";
import { Typography } from "./modular";
import { flexCenter } from "@/styles/theme";
import cardPalette from "@/resources/static/card-palette";
import SimpleMarkdownParser from "./SimpleMarkdownParser";


const defaultTitles: Record<string, string> = {
  funny: "Cartão Engraçado 🤪",
  professional: "Cartão Profissional 🤗",
  invitation: "Cartão de Convite 📅",
  romantic: "Cartão Romântico ❤️",
};


export type CardProps = {
  b?: boolean;
  c?: string;
  cn?: string;
  bgl?: boolean;
  bs?: boolean;
  cc?: string;
  i?: string | null;
  title?: string | null;
};

const Card = (p: CardProps) => {
  const background = p.bgl ? cardPalette[p.cc ?? "funny"].bg : "var(--box-bg)";

  return (
    <Box
      className={cn("ccard", p.cn)}
      sx={{
        maxWidth: "448px",
        width: "100%",
        minHeight: "12rem",
        maxHeight: "35rem",
        padding: "1rem 1.1rem",
        backgroundColor: background,
        borderRadius: "9px",
        border: `4px solid ${p.b ? cardPalette[p.cc ?? "funny"].accent : "transparent"}`,
        boxShadow: p.bs ? "0 5px 1rem -1px rgba(0, 0, 0, 1)" : undefined,
        position: "relative",
        overflow: "visible",
        zIndex: "+80",

        "& > .card-title": {
          display: "inline-block",
          width: "100%",
          letterSpacing: 0,
          fontSize: "1.75rem",
          fontWeight: 600,
          textAlign: "center",
        },

        "& > .card-icon": {
          padding: "0.5rem",
          borderRadius: "50%",
          backgroundColor: background,
          position: "absolute",
          width: "4rem",
          height: "4rem",
          zIndex: "+110",
          boxShadow: p.bs ? "0 4px 12px var(--soft-shadow-color)" : undefined,
          border: `4px solid ${p.b ? cardPalette[p.cc ?? "funny"].accent : "var(--border-color)"}`,
          ...flexCenter,

          "&.top-left": {
            top: "-1.5rem",
            left: "-1.5rem",
          },

          "&.bottom-right": {
            right: "-1.5rem",
            bottom: "-1.5rem",
          },
        },
      }}
    >
      {
        p.title != null && typeof p.title !== "undefined" ? (
          <Typography.Title className="card-title font-jet-mono">
            {p.title !== "__$__default" ? p.title : defaultTitles[p.cc ?? "funny"]}
          </Typography.Title>
        ) : null
      }
      {
        p.i != null ? (
          <>
            <div className="card-icon top-left">
              <Icon icon={p.i as any} />
            </div>
            <div className="card-icon bottom-right">
              <Icon icon={p.i as any} />
            </div>
          </>
        ) : null
      }
      <Box
        className="font-jet-mono"
        sx={{
          width: "100%",
          maxHeight: "27rem",
          overflow: "auto",
          marginTop: "2.675rem",
          lineHeight: "1.5",

          "& h4": {
            fontSize: "1.3rem",
            fontWeight: 500,
          },

          "& :where(em, strong, p, a)": {
            fontSize: "0.975rem",
            fontWeight: "normal",
            letterSpacing: "calc(var(--default-letter-spacing) / 4)",
          },

          "& strong": {
            fontWeight: 800,
          },

          "& a": {
            color: "var(--theme-blue)",
          },
        }}
      >
        <SimpleMarkdownParser content={p.c} />
      </Box>
    </Box>
  );
};

export default memo(Card);
