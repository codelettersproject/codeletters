import { Box } from "@mui/material";
import React, { forwardRef, memo, TextareaHTMLAttributes, useEffect, useId, useRef, useState } from "react";

import Icon from "./Icon";
import Button from "./Button";
import { delayed } from "@/utils";
import { Typography } from "./modular";
import { flexCenter } from "@/styles/theme";
import { EventController } from "@/lib/react";


type SxProperties = {
  minHeight?: string;
  fontSize?: string;
};

export interface ResizableTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxHeight?: string;
  sx?: SxProperties;
  trimValues?: boolean;
  resetIcon?: boolean;
  helpText?: string | null;
  _controller?: EventController;
  onUpdateText?: (value: string) => unknown;
}

// eslint-disable-next-line react/display-name
const ResizableTextarea = forwardRef<HTMLTextAreaElement, ResizableTextareaProps>(({
  sx,
  label,
  helpText,
  maxHeight,
  resetIcon,
  trimValues,
  _controller,
  onUpdateText,
  ...props
}, ref) => {
  const id = props.id ?? useId();
  const internalRef = useRef<HTMLTextAreaElement>(null);

  const combinedRef = (node: HTMLTextAreaElement) => {
    internalRef.current = node;

    if(typeof ref === "function") {
      ref(node);
    } else if(ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
  };

  const [value, setValue] = useState<string>(props.value?.toString() || "");

  useEffect(() => {
    const textarea = internalRef.current;

    if(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      if(maxHeight) {
        textarea.style.maxHeight = maxHeight;
        textarea.style.overflowY = "auto";
      }
    }
  }, [value, maxHeight]);

  useEffect(() => {
    _controller?.on("reset", () => {
      if(internalRef.current) {
        internalRef.current.value = "";
        internalRef.current.focus();
                
        delayed(() => {
          handleChange({ target: { value: "" } } as any);
        }, 20);
      }
    });
  }, [_controller]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;

    setValue(trimValues !== false ? newValue.trim() : newValue);

    onUpdateText?.(newValue);
    props.onChange?.(event);
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",

        "& > textarea": {
          overflow: "auto",
          padding: ".5rem .55rem",
          lineHeight: "1.5",
          // fontSize: '0.9rem',
          fontWeight: "normal",
          letterSpacing: "var(--default-letter-spacing)",
          resize: "none !important",
          width: "100%",
          borderRadius: ".32rem",
          outlineOffset: "1.5px",
          outlineWidth: "2px",
          marginTop: ".2rem",
          minHeight: sx?.minHeight || "200px",
          outlineColor: "transparent",
          border: "none",
          backgroundColor: "var(--surface-color)",
          color: "var(--text-color)",
        
          "&:focus": {
            outline: "2px solid var(--theme-violet)",
          },
        },

        "& > label": {
          display: "inline-block",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "calc(var(--default-letter-spacing) / 2)",
          color: "var(--text-color)",
          pointerEvents: "none",
          userSelect: "none",
        },

        "& > button": {
          position: "absolute",
          bottom: "1rem",
          right: "1.1rem",
          borderRadius: "50%",
          backgroundColor: "var(--theme-red)",
          color: "#fefeff",
          zIndex: "+50",
          cursor: "pointer",
          padding: ".32rem",
          boxShadow: "0 1px 6px -1px var(--theme-red-A100)",
          transition: "transform .5s ease-out",
          border: 0,
          outline: "none",
          ...flexCenter,

          "&:active": {
            transform: "rotate(-300deg)",
          },

          "&:focus-visible": {
            outlineOffset: "2px",
            outline: "2px solid var(--accent-color)",
          },

          "& > .icon": {
            fontSize: "22px",
            fontWeight: 300,
          },
        },

        "& > span": {
          position: "absolute",
          top: "100%",
          width: "100%",
          textAlign: "right",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "calc(var(--default-letter-spacing) / 2)",
          color: "var(--theme-red)",
        },
      }}
    >
      {
        label ? (
          <label htmlFor={id}>
            <Typography.Text>
              {label}
            </Typography.Text>
          </label>
        ) : null
      }
      <textarea
        {...props}
        id={id}
        ref={combinedRef}
        onChange={handleChange}
      />
      {
        resetIcon && value.trim().length > 0 && !props.disabled ? (
          <Button
            tabIndex={0}
            title="Limpar caixa de texto"
            onClick={() => {
              if(internalRef.current) {
                internalRef.current.value = "";
                internalRef.current.focus();
                
                delayed(() => {
                  handleChange({ target: { value: "" } } as any);
                }, 20);
              }
            }}
          >
            <Icon icon="restart" />
          </Button>
        ) : null
      }
      {
        helpText ? (
          <Typography.Text>
            {helpText}
          </Typography.Text>
        ) : null
      }
    </Box>
  );
});

export default memo(ResizableTextarea);
