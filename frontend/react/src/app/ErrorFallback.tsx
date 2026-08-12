// ErrorFallback.tsx

import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { AlertOctagon } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorFallbackProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function ErrorFallback({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: ErrorFallbackProps) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "var(--bg)",
        padding: theme.spacing(3),
      })}
    >
      <Container maxWidth="sm">
        <Paper
          variant="outlined"
          sx={(theme) => ({
            padding: theme.spacing(4),
            textAlign: "center",
            borderColor: "var(--accent-border)",
            bgcolor: "var(--code-bg)",
          })}
        >
          <Box
            sx={(theme) => ({
              mb: theme.spacing(2),
              display: "flex",
              justifyContent: "center",
            })}
          >
            {icon ?? <AlertOctagon size={48} color="var(--accent)" />}
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700, color: "var(--text-h)" }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={(theme) => ({
              mb: theme.spacing(3),
              fontFamily: "var(--mono)",
              color: "var(--text)",
            })}
          >
            {message}
          </Typography>

          {actionLabel && onAction && (
            <Button
              variant="contained"
              onClick={onAction}
              sx={{
                bgcolor: "var(--accent)",
                color: "var(--bg)",
                "&:hover": {
                  bgcolor: "var(--accent)",
                  opacity: 0.9,
                },
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}