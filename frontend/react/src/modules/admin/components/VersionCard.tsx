import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { HealthStatus } from "../types/health";

interface VersionCardProps {
  versions: HealthStatus[];
}


const VersionCard = ({ versions }:VersionCardProps) => {

  return (
    <Card
      variant="outlined"
      data-testid="version-card"
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
          Component Versions
        </Typography>

        <Divider
          sx={{
            mb: 2,
          }}
        />

        <Stack spacing={1}>
          {versions.map((row:HealthStatus) => (
            <Stack
              key={row.id}
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {row.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                }}
              >
               {row.version}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VersionCard;