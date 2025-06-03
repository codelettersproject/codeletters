import React from "react";

import type { IconProps } from "@/components";


export type IMenuEntry = {
  label: string;
  htmlTitle?: string;
  icon?: IconProps["icon"] | Exclude<React.ReactNode, string>;
  activeIcon?: IconProps["icon"] | Exclude<React.ReactNode, string>;
  color?: string;
  contrast?: string;
  shift?: `${"icon" | "label" | "both"}-${"up" | "down"}` | {
    icon?: "up" | "down",
    label?: "up" | "down",
  };
  routerMath?: RegExp;
  matchRoutes?: string[];
} & (
  | {
    type: "go";
    path: string | {
      pathname: string;
      query?: string;
      hash?: string;
    }
  }
  | {
    type: "do";
    action: () => unknown;
  }
  | {
    type: "fwr";
    href: string;
  }
);
