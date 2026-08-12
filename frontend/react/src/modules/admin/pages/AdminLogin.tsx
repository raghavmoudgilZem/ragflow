import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

import { adminLogin } from "../api/admin-service";
import { ADMIN_LOGIN_MESSAGES } from "../constants/constants";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError(null);

    try {
      await adminLogin({
        email: username,
        password,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : ADMIN_LOGIN_MESSAGES.LOGIN_FAILED,
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 380,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            {ADMIN_LOGIN_MESSAGES.TITLE}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            {ADMIN_LOGIN_MESSAGES.SUBTITLE}
          </Typography>

          {(error || window.location.search.includes("token_expired")) && (
            <Alert severity="error" data-testid="login-error" sx={{ mb: 2 }}>
              {error || ADMIN_LOGIN_MESSAGES.TOKEN_EXPIRED}
            </Alert>
          )}
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              margin="normal"
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{
                htmlInput: {
                  "data-testid": "username-input",
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              margin="normal"
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                htmlInput: {
                  "data-testid": "password-input",
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              data-testid="login-submit"
              sx={{
                mt: 3,
                py: 1.4,
              }}
            >
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogin;
