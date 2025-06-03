import React from "react";
import { Box } from "@mui/material";
import type { Dict } from "typesdk/types";
import { inorderTransversal, type MultidimensionalArray } from "typesdk/array";

import { useMediaQuery } from "@/hooks";
import { Link, Typography } from "@/components";


export function cn(...values: MultidimensionalArray<string | Dict<boolean | null | undefined> | null | undefined>): string {
  const result: string[] = [];
  const gen = inorderTransversal([values]);

  let c = gen.next();

  while(!c.done) {
    if(c.value) {
      if(typeof c.value === "string") {
        result.push(c.value.trim());
      } else if(typeof c.value === "object" && !Array.isArray(c.value)) {
        for(const prop in c.value) {
          if(!Object.prototype.hasOwnProperty.call(c.value, prop)) continue;
          if(c.value[prop] !== true) continue;
  
          result.push(prop.trim());
        }
      }
    }

    c = gen.next();
  }

  return result.join(" ");
}


export function addOpacityToHexColorAsRGBA(hexColor: string, opacity: number): string {
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexColor) || opacity < 0 || opacity > 1) {
    throw new Error("Invalid input. Please provide a valid hex color code and opacity value between 0 and 1.");
  }

  // Convert hex to RGB
  let r: number = 0;
  let g: number = 0;
  let b: number = 0;

  if (hexColor.length === 4) {
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  } else if (hexColor.length === 7) {
    r = parseInt(hexColor.slice(1, 3), 16);
    g = parseInt(hexColor.slice(3, 5), 16);
    b = parseInt(hexColor.slice(5, 7), 16);
  }

  // Ensure RGB values are valid
  if(isNaN(r) || isNaN(g) || isNaN(b)) {
    throw new Error("Invalid hex color code.");
  }

  // Calculate the new RGBA values
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  return rgbaColor;
}


export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 61.25rem)");
}


export function safeDelay(amount: number = 750): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, amount));
}

export function safeClamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}


export type CustomText = string | (
  | {
    type: "text" | "italic" | "bold" | ("text" | "italic" | "bold")[];
    value: string;
    color?: string;
  }
  | {
    type: "link";
    subtype?: "text" | "italic" | "bold" | ("text" | "italic" | "bold")[];
    href: string;
    textContent?: string;
    color?: string;
    target?: "_self" | "_blank" | "_parent" | "_top";
  }
  | {
    type: "list";
    kind: "ordered" | "unordered";
    className?: string;
    content: CustomText[];
  }
  | { type: "line-break" }
)[];

export function text(node: CustomText, wrapper?: React.ExoticComponent | null, keyId?: string): React.ReactNode {
  let lbi = 0;

  const hasList = Array.isArray(node) ? node.some(item => item.type === "list") : false;
  const Component = wrapper ?? (hasList ? Box : Typography.Text);

  return (
    <Component className={typeof node === "string" ? "as-text" : undefined}>
      {
        Array.isArray(node) ? node.map((item, itemIndex) => {
          const classes: Record<string, boolean> = {};

          if(item.type === "line-break") return (
            <br key={`${keyId || "text-apply"}-line-break-${itemIndex}-${lbi++}`} />
          );

          if(item.type !== "list") {
            const types = item.type === "link" ? 
              (Array.isArray(item.subtype) ? item.subtype : [item.subtype]):
              (Array.isArray(item.type) ? item.type : [item.type]);
        
            for(const kind of types) {
              if(!kind)
                continue;
            
              classes[`as-${kind}`] = true;
            }
          }

          if(item.type === "list") {
            const ListContent = () => {
              return (
                <React.Fragment>
                  {
                    item.content.map((listItem, listItemIndex) => (
                      <li
                        key={`${keyId || "text-apply"}-list-${itemIndex}-subitem-${listItemIndex}`}
                      >
                        {text(listItem, wrapper, keyId)}
                      </li>
                    ))
                  }
                </React.Fragment>
              );
            };

            if(item.kind === "ordered") return (
              <ol
                key={`${keyId || "text-apply"}-list-menu-${itemIndex}`}
                className={cn("as-list", "list-ordered", classes)}
              >
                <ListContent />
              </ol>
            );

            return (
              <ul
                key={`${keyId || "text-apply"}-list-menu-${itemIndex}`}
                className={cn("as-list", "list-unordered", classes)}
              >
                <ListContent />
              </ul>
            );
          }

          if(item.type === "link") return (
            <Link
              href={item.href}
              target={item.target}
              className={cn("as-link", classes)}
              key={`${keyId || "text-apply"}-text-fragment-${itemIndex}`}
            >
              <Typography.Text>
                {item.textContent ?? item.href}
              </Typography.Text>
            </Link>
          );
        
          return (
            <span
              className={cn(classes)}
              key={`${keyId || "text-apply"}-text-fragment-${itemIndex}`}
            >
              {item.value}
            </span>
          );
        }) : node
      }
    </Component>
  );
}
