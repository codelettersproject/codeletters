import React from "react";

import type { IconProps } from "@/components";


export interface IMenuEntry {
  label: string;
  icon?: IconProps["icon"] | Exclude<React.ReactNode, string>;
  activeIcon?: IconProps["icon"] | Exclude<React.ReactNode, string>;
  path: string | {
    pathname: string;
    query?: string;
    hash?: string;
  };
  color?: string;
  contrast?: string;
  shift?: `${"icon" | "label" | "both"}-${"up" | "down"}` | {
    icon?: "up" | "down",
    label?: "up" | "down",
  };
  routerMath?: RegExp;
  matchRoutes?: string[];
}
