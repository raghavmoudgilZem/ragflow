import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const PageLoader: React.FC = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Loading page...
      </Typography>
    </Box>
  );
};

export default PageLoader;