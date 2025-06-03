import React from "react";
import { Box } from "@mui/material";
import type { Dict } from "typesdk/types";
import { inorderTransversal, type MultidimensionalArray } from "typesdk/array";

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
