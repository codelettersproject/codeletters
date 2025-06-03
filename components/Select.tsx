import { Box } from "@mui/material";
import { EventEmitter } from "typesdk/events";
import React, { HTMLAttributes, forwardRef, useEffect, useId, useRef, useState, memo } from "react";

import Icon, { IconProps } from "./Icon";
import { useClickOutside } from "@/hooks";
import Typography from "./modular/typography";
import { addOpacityToHexColorAsRGBA, cn } from "@/utils/react";


type SelectButtonStyles = {
  background?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  padding?: string;
  border?: string;
  boxShadow?: string;
  lineHeight?: string | number;
};

type SelectOptionStyles = {
  fontSize?: string;
  iconSize?: string;
  fontWeight?: string;
  lineHeight?: string | number;
}

export interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  onSelectedValueChange?: ((value: Omit<SelectItemProps, "onClick"> | string | undefined) => void);
  placeholderIcon?: IconProps["icon"] | React.ReactNode;
  options: Omit<SelectItemProps, "onClick">[];
  ee?: EventEmitter | null | undefined;
  optionsStyles?: SelectOptionStyles;
  buttonStyles?: SelectButtonStyles;
  defaultSelectedValue?: string;
  direction?: "top" | "bottom";
  float?: "left" | "right";
  disallowUndefined?: boolean;
  buttonClassName?: string;
  placeholder?: string;
  maxHeight?: string;
  iconSize?: string;
  maxWidth?: string;
  minWidth?: string;
  outline?: boolean;
  height?: string;
}

// eslint-disable-next-line react/display-name
const Select = forwardRef<HTMLDivElement, SelectProps>(({
  onSelectedValueChange,
  defaultSelectedValue,
  disallowUndefined,
  placeholderIcon,
  buttonClassName,
  buttonStyles,
  placeholder,
  className,
  maxHeight,
  direction,
  maxWidth,
  minWidth,
  iconSize,
  outline,
  options,
  height,
  float,
  id,
  ee,
  ...props
}, ref) => {
  const componentId = id ?? useId();
  const componentRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string | undefined>(undefined);
  const [selectedIcon, setSelectedIcon] = useState<React.ReactNode | IconProps["icon"] | undefined>(undefined);

  useClickOutside(componentRef, () => {
    if(isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if(!defaultSelectedValue || defaultSelectedValue.trim().length < 1) return;
    const item = options?.find(item => item.value === defaultSelectedValue);

    if(!item) return;

    setSelectedIcon(item.icon);
    setSelectedText(item.label);
    setIsOpen(false);
  }, [defaultSelectedValue]);

  ee?.subscribe("SIGRESET", () => {
    setSelectedIcon(placeholderIcon);
    setSelectedText(placeholder);

    setIsOpen(false);

    onSelectedValueChange?.(undefined);
  });

  return (
    <div ref={componentRef} style={{ width: "100%" }}>
      <Box
        {...props}
        ref={ref}
        component="div"
        className={cn("drawer-ui-select-component", className, "select-component")}
        sx={{
          maxWidth,
          position: "relative",
          width: "100%",

          "& > button": {
            width: "100%",
            height: height ?? "48px",
            backgroundColor: buttonStyles?.background ?? "var(--box-bg)",
            color: buttonStyles?.color ?? (options.find(item => item.label === selectedText)?.color || "var(--text-color)"),
            fontSize: buttonStyles?.fontSize ?? "15px",
            fontWeight: buttonStyles?.fontWeight ?? "500",
            borderRadius: buttonStyles?.borderRadius ?? "4px",
            padding: buttonStyles?.padding ?? "0 16px",
            border: outline ? "none" : buttonStyles?.border ?? "1px solid var(--border-color)",
            boxShadow: outline ? "none" : buttonStyles?.boxShadow,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            "&:hover": {
              backgroundColor: outline ? "var(--hover-muted-color)" : buttonStyles?.background ?? "var(--box-bg)",
            },

            "& > .icon": {
              fontWeight: 300,
              color: "var(--text-secondary)",
              marginTop: "3.5px",
              marginLeft: "5px",
            },

            "& > div": {
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              width: "100%",

              "& > span": {
                width: "100%",
                textAlign: "left",
                fontWeight: "normal",
              },

              "& > .icon": {
                fontSize: iconSize ?? "22px",
                fontWeight: 300,
              },
  
              "& > img": {
                width: iconSize ?? "22px",
                height: iconSize ?? "22px",
                objectFit: "cover",
                pointerEvents: "none",
                userSelect: "none",
              },
            },
          },

          "&:focus-visible": {
            outlineOffset: "2px",
            ouline: "2px solid var(--accent-color) !important",
          },
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(current => !current)}
          className={cn("select-component__button", buttonClassName)}
        >
          <div>
            {
              selectedIcon ? (
                <>
                  {
                    typeof selectedIcon === "string" ? (
                      <Icon icon={selectedIcon as unknown as IconProps["icon"]} />
                    ) : selectedIcon
                  }
                </>
              ) : typeof placeholderIcon === "string" ? (
                <Icon icon={placeholderIcon as unknown as IconProps["icon"]} />
              ) : placeholderIcon
            }
            <Typography.Text>{selectedText ?? placeholder ?? "Select an option"}</Typography.Text>
          </div>
          <Icon icon={`chevron-${isOpen ? "up" : "down"}`} />
        </button>
        <Box
          sx={{
            width: "100%",
            minWidth,
            maxWidth,
            maxHeight: maxHeight ?? "200px",
            position: "absolute",
            [direction === "bottom" ? "bottom" : "top"]: "calc(100% + 12.5px)",
            [float === "left" ? "right" : "left"]: 0,
            backgroundColor: "var(--box-bg)",
            borderRadius: "4px",
            boxShadow: "0px 2.4px 18px -1px rgba(0, 0, 0, 0.1)",
            zIndex: 200,
            padding: "2.4px 0",
            transition: "transform .2s ease",
            border: "1px solid var(--border-color)",
            overflowY: "auto",
            overflowX: "hidden",

            "& > button ~ button": {
              marginBottom: "1px",
            },

            ...(() => {
              if(!isOpen) return {
                pointerEvents: "none",
                transform: "scale(0)",
              };

              return {
                pointerEvents: "auto",
                transform: "scale(1)",
              };
            })(),
          }}
        >
          {
            disallowUndefined ? null : (
              <SelectItem
                icon={placeholderIcon}
                label={placeholder ?? "Select an option"}
                value="undefined"
                height={height}
                onClick={() => {
                  setSelectedIcon(placeholderIcon);
                  setSelectedText(placeholder);

                  setIsOpen(false);

                  onSelectedValueChange?.(undefined);
                }}
              />
            )
          }
          {
            options?.map((item, index) => (
              <SelectItem
                key={`select-${componentId}-item-${index.toString(8)}`}
                icon={item.icon}
                label={item.label}
                value={item.value}
                height={height}
                color={item.color}
                styles={props.optionsStyles}
                onClick={() => {
                  setSelectedIcon(item.icon);
                  setSelectedText(item.label);

                  setIsOpen(false);

                  onSelectedValueChange?.(item);
                }}
              />
            ))
          }
        </Box>
      </Box>
    </div>
  );
});


export type SelectItemProps = {
  icon?: React.ReactNode | Omit<string, NonNullable<IconProps["icon"]>>;
  styles?: SelectOptionStyles;
  onClick?: (() => void);
  iconSize?: string;
  selectId?: string;
  height?: string;
  color?: string;
  label: string;
  value: string;
}

// eslint-disable-next-line react/display-name
export const SelectItem = memo((props: SelectItemProps) => {
  const componentId = `${props.selectId ?? ""}${useId()}`.replace(/:/g, "").replace(/\s+/g, "");
  
  return (
    <Box
      data-select-component-id={props.selectId}
      data-select-option-value={props.value}
      onClick={props.onClick}
      component="button"
      id={componentId}
      type="button"
      role="button"
      tabIndex={0}
      sx={{
        width: "100%",
        height: props.height ?? "48px",
        background: "transparent",
        border: "1px solid transparent",
        outlineOffset: "1px",
        outlineColor: "var(--accent-color)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        paddingLeft: "18px",
        transition: "background-color .18s ease-in-out",
        color: props.color ?? "var(--text-color)",

        "&:hover": {
          backgroundColor: props.color ? addOpacityToHexColorAsRGBA(props.color, 0.1) : "var(--hover-muted-color)",
        },

        "& > span": {
          display: "inline-block",
          color: "inherit",
          fontSize: props.styles?.fontSize ?? "15px",
          fontWeight: props.styles?.fontWeight ?? "normal",
          width: "100%",
          textAlign: "left",
          lineHeight: props.styles?.lineHeight,
        },

        "& > .icon": {
          fontSize: props.iconSize ?? "22px",
          color: "unset",
        },

        "& > img": {
          width: props.iconSize ?? "22px",
          height: props.iconSize ?? "22px",
          objectFit: "cover",
          pointerEvents: "none",
          userSelect: "none",
        },
      }}
    >
      {
        typeof props.icon === "string" ? (
          <Icon icon={props.icon as unknown as IconProps["icon"]} />
        ) : props.icon
      }
      <Typography.Text>{props.label}</Typography.Text>
    </Box>
  );
});

export default memo(Select);
