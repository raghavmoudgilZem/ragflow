import { Bar, Doughnut } from "react-chartjs-2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import type { HealthStatus } from "../types/health";
import { barOptions, doughnutOptions, getBarData, getDoughnutData } from "../utils/chartConfig";

interface HealthChartProps {
  services: HealthStatus[];
}

const HealthChart = ({ services }: HealthChartProps) => {
  return (
    <Card
      variant="outlined"
      data-testid="health-chart"
      sx={{
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          System Health Overview
        </Typography>

        <Grid
          container
          spacing={3}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 2,
              }}
            >
              Availability
            </Typography>

            <Doughnut
              data={getDoughnutData(services)}
              options={doughnutOptions}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 2,
              }}
            >
              Response Times
            </Typography>

            <Bar
              data={getBarData(services)}
              options={barOptions}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HealthChart;