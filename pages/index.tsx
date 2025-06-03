import React from "react";
import { Box } from "@mui/material";


const App = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100dvh",
        zIndex: 200,
        backgroundColor: "var(--body-bg)",
        color: "var(--text-color)",
      }}
    >
      content
    </Box>
  );
};

export default App;
