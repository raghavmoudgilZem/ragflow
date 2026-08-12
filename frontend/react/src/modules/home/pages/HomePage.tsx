import { Box } from '@mui/material';
import { HomeBanner } from '../components/sections/HomeBanner';
import { DatasetSection } from '../components/sections/DatasetSection';
import { ApplicationsSection } from '../components/sections/ApplicationsSection';

export const HomePage = () => (
  <Box
    sx={{
      height: 'calc(100dvh - 56px)', // subtract nav height
      overflowY: 'auto',
    }}
  >
    <HomeBanner />
    <Box sx={(theme) => ({ paddingLeft: { xs: theme.spacing(3), md: theme.spacing(5) }, paddingRight: { xs: theme.spacing(3), md: theme.spacing(5) }, paddingBottom: theme.spacing(6) })}>
      <DatasetSection />
      <ApplicationsSection />
    </Box>
  </Box>
);
