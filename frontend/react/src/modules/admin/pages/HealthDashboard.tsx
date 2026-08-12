import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";

import { useHealth } from "../hooks/useHealth";
import HealthCard from "../components/HealthCard";
import VersionCard from "../components/VersionCard";
import HealthChart from "../components/HealthChart";
import { logout } from "../services/adminAuth";
import { Chip } from "@mui/material";
import { HEALTH_DASHBOARD_TEXT } from "../constants/constants";
const statusColor: Record<string, string> = {
  Healthy: "success.main",
  Degraded: "error.main",
  Warning: "warning.main",
  Unknown: "text.secondary",
};

const HealthDashboard = () => {
  const {
    data,
    loading,
    error,
    overallStatus,
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    refresh,
  } = useHealth();
  const color = statusColor[overallStatus ?? "Unknown"] || "text.primary";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: {
          xs: 2,
          md: 4,
        },
      })}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
            }}
          >
             {HEALTH_DASHBOARD_TEXT.TITLE}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: color,
              }}
            />

            <Chip
              label={overallStatus}
              sx={{
                mt: 1,
                background: color,
                color: color,
                fontWeight: 700,
                border: `1px solid ${color}`,
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            {lastUpdated
              ? `Last updated: ${dayjs(lastUpdated).format("HH:mm:ss")}`
              : "Fetching status..."}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <FormControlLabel
            label="Auto refresh (30s)"
            sx={{
              color: "text.primary",
              "& .MuiFormControlLabel-label": {
                color: "text.primary",
              },
            }}
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                data-testid="auto-refresh-toggle"
              />
            }
          />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={loading}
            data-testid="manual-refresh-button"
            sx={{
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "action.hover",
              },
            }}
          >
        
           {HEALTH_DASHBOARD_TEXT.REFRESH_BUTTON}
          </Button>

          <Button
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            data-testid="logout-button"
            sx={{
              color: "text.primary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
           {HEALTH_DASHBOARD_TEXT.LOGOUT_BUTTON}
          </Button>
        </Stack>
      </Stack>

      {loading && data.length === 0 && (
        <Stack
          data-testid="loading-indicator"
          sx={{
            py: 6,
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Stack>
      )}

      {error && (
        <Alert
          severity="error"
          data-testid="dashboard-error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info" data-testid="empty-state">
          No data found
        </Alert>
      )}

      {data.length > 0 && (
        <>
          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            {data.map((service) => (
              <Grid
                key={service.name}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <HealthCard service={service} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >
              <HealthChart services={data} />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <VersionCard versions={data} />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default HealthDashboard;
