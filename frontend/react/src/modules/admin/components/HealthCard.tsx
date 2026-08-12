import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { HealthStatus } from "../types/health";
import StatusBadge from "./StatusBadge";

dayjs.extend(relativeTime);

interface HealthCardProps {
  service: HealthStatus;
}

const HealthCard = ({ service }: HealthCardProps) => {
  return (
    <Card
      variant="outlined"
      data-testid={`health-card-${service.name}`}
      sx={{
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
            }}
          >
            {service.name}
          </Typography>

          <StatusBadge status={service.status} />
        </Stack>

        <Stack
          spacing={0.5}
          sx={{
            mt: 1.5,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {service.status === "Healthy"
              ? `Ping: ${service.responseTime} ms`
              : "Unavailable"}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Updated {dayjs(service.lastUpdated).fromNow()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HealthCard;