import Chip from "@mui/material/Chip";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const isUp = status === "Healthy";

  return (
    <Chip
      data-testid="status-badge"
      label={isUp ? "🟢 Online" : "🔴 Offline"}
      color={isUp ? "success" : "error"}
      size="small"
      variant="filled"
    />
  );
};

export default StatusBadge;
