import { type SxProps, Box } from "@mui/material";
import React, { ButtonHTMLAttributes, forwardRef, memo } from "react";


export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "discreet" | "with-icon";
  sx?: SxProps;
}

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant,
  sx,
  ...props
}, ref) => {
  const styles: Record<string, SxProps> = {
    discreet: {
      width: "max-content",
      cursor: "pointer",
      background: "transparent",
      border: "1px solid transparent",
      outline: "none",
      padding: ".32rem .78rem",
      borderRadius: "4px",
      color: "var(--text-color)",

      
      "@media (hover: hover)": {
        
        "&:hover": {
          backgroundColor: "var(--hover-muted-color)",
        },
      },
    },
  };

  if(!props.type) {
    props.type = "button";
  }

  return (
    <Box
      {...props}
      component="button"
      role={props.role ?? "button"}
      ref={ref}
      sx={Object.assign({}, variant ? styles[variant] : styles.default, sx)}
    >
      {children}
    </Box>
  );
});

export default memo(Button);
