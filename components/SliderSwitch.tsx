import { Box } from "@mui/material";
import React, { InputHTMLAttributes, useId, useState, memo } from "react";


export type ToggleEvent = {
  readonly event: React.ChangeEvent<HTMLInputElement>;
  readonly checked: boolean;
  readonly id: string;
}

export interface SliderSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  onStateToggle?: ((__event: ToggleEvent) => void);
  foregroundColor?: string;
  color?: string;
  scale?: number;
  buttonSize?: string | number;
}

const SliderSwitch = ({
  onStateToggle,
  foregroundColor,
  color,
  buttonSize,
  scale,
  id,
  ...props
}: SliderSwitchProps) => {
  const componentId = id ?? useId();
  const s = scale && typeof scale === "number" ? scale : 1;

  const w = buttonSize ? 
    typeof buttonSize === "number" ?
      `${buttonSize}px` :
      buttonSize :
    "2em";

  const h = buttonSize ? 
    typeof buttonSize === "number" ? 
      `${buttonSize / 2}px` :
      `${parseInt(buttonSize) / 2}px` :
    "1em";


  const [, setState] = useState<"on" | "off">(props.defaultChecked ? "on" : "off");

  function __$__onDidUpdateState(event: React.ChangeEvent<HTMLInputElement>) {
    setState(event.target.checked ? "on" : "off");
    onStateToggle?.({
      checked: event.target.checked,
      id: componentId,
      event,
    });
  }


  return (
    <Box
      sx={{
        "& > input": {
          opacity: 0,
          position: "absolute",
          top: "-9000%",
          left: "-9000%",
          pointerEvents: "none",

          "&:checked + label": {
            color: color ?? "var(--theme-color)",

            "&::after": {
              left: "50%",
            },
          },
        },

        "& > label": {
          "&::before": {
            content: "\"\"",
            width: `calc(${w} * ${s})`,
            height: `calc(${h} * ${s})`,
            backgroundColor: foregroundColor ?? "var(--theme-A100)",
            borderRadius: `calc(${h} * ${s})`,
            marginRight: "0.25em",
          },

          "&::after": {
            content: "\"\"",
            width: `calc(${h} * ${s})`,
            height: `calc(${h} * ${s})`,
            backgroundColor: color ?? "var(--theme-color)",
            borderRadius: `calc(${h} * ${s})`,
            position: "absolute",
            left: 0,
            transition: "left .21s ease-in-out",
          },

          display: "flex",
          position: "relative",
          cursor: "pointer",
        },
      }}
    >
      <input
        {...props}
        type="checkbox"
        autoComplete="off"
        spellCheck="false"
        id={componentId}
        onChange={__$__onDidUpdateState}
      /> 
      <label htmlFor={componentId}></label>
    </Box>
  );
};

export default memo(SliderSwitch);
