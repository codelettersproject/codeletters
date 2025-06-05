import { Box, type SxProps } from "@mui/material";
import React, { forwardRef, InputHTMLAttributes, memo, useId } from "react";

import Typography from "./modular/typography";
import Icon, { type IconProps } from "./Icon";


export interface FormGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  height?: string;
  icon?: React.ReactNode | IconProps["icon"];
  sx?: SxProps;
  helpText?: string | null;
  isValid?: (__input: string) => boolean;
}

// eslint-disable-next-line react/display-name
const FormGroup = forwardRef<HTMLInputElement, FormGroupProps>(({
  label,
  id,
  icon,
  color,
  height,
  backgroundColor,
  borderColor,
  helpText,
  ...props
}, ref) => {
  const componentId = id || useId();

  const labelSx = Object.assign({}, {
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "normal",
    letterSpacing: "calc(var(--default-letter-spacing) / 2)",
    color: color || "var(--text-color)",
    pointerEvents: "none",
    userSelect: "none",
  } as any, (props.sx as any)?.["& > label"]);

  const inputSx = Object.assign({}, {
    width: "100%",
    height: height || "42px",
    borderRadius: ".32rem",
    outlineOffset: "1.5px",
    outlineWidth: "2px",
    outlineColor: "transparent",
    border: "none",
    backgroundColor: backgroundColor ?? "var(--surface-color)",
    padding: "0 .74rem",
    paddingLeft: icon ? "2.74rem" : ".74rem",
    marginTop: ".2rem",
    outline: "none",
    color: color || "var(--text-color)",

    "&:focus": {
      outline: `2px solid ${borderColor || "var(--theme-color)"}`,
    },
  }, (props.sx as any)?.["& > input"]);

  const iconSx = Object.assign({}, {
    width: "22px",
    height: "22px",
    fontSize: "22px",
    position: "absolute",
    top: icon ? `calc(50% + (${height || "42px"} * .2762))` : "50%",
    left: ".5rem",
    transform: "translateY(-50%)",
    color: "var(--text-secondary)",
    pointerEvents: "none !important",
    marginTop: "1.5px",
    fontWeight: 300,
  }, (props.sx as any)?.["& > .icon"], (props.sx as any)?.["& > i"], (props.sx as any)?.["& > svg"], (props.sx as any)?.["& > .icon, & > i, & > svg"]);

  const helpTextSx = Object.assign({}, {
    position: "absolute",
    top: "100%",
    width: "100%",
    textAlign: "right",
    fontSize: "12px",
    fontWeight: "normal",
    letterSpacing: "calc(var(--default-letter-spacing) / 2)",
    color: "var(--theme-red)",
    marginTop: "0.2rem",
  }, (props.sx as any)?.["& > p"]);


  return (
    <Box
      className="form-group field"
      sx={{
        width: "100%",
        position: "relative",
        
        "& > label": labelSx,
        "& > input": inputSx,
        "& > .icon, & > i, & > svg": iconSx,
        "& > p": helpTextSx,
      }}
    >
      {
        label ? (
          <label htmlFor={componentId}>
            <Typography.Text>{label}</Typography.Text>
          </label>
        ) : null
      }
      {
        icon ? (
          typeof icon === "string" ? 
            <Icon icon={icon as IconProps["icon"]} /> :
            icon
        ) : null
      }
      <input
        {...props}
        id={componentId}
        ref={ref}
      />
      {
        helpText ? (
          <p>
            <Typography.Text>{helpText}</Typography.Text>
          </p>
        ) : null
      }
    </Box>
  );
});

export default memo(FormGroup);
