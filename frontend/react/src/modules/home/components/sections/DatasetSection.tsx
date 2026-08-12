import { Box, Skeleton } from '@mui/material';
import { Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHomeDatasets } from '../../hooks/useHomeDatasets';
import { CardGrid } from '../layout/CardGrid';
import { SectionHeader } from '../layout/SectionHeader';
import { DatasetCard } from '../cards/DatasetCard';
import { EmptyStateCard } from '../cards/EmptyStateCard';
import { SeeAllCard } from '../cards/SeeAllCard';

export const DatasetSection = () => {
  const { data: datasets, isLoading } = useHomeDatasets();
  const navigate = useNavigate();

  return (
    <Box sx={(theme) => ({ marginBottom: theme.spacing(6) })}>
      <SectionHeader
        label="Datasets"
        icon={<Library size={24} />}
      />

      {isLoading ? (
        <Skeleton
          variant="rectangular"
          height={128}
          sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
        />
      ) : !datasets || datasets.length === 0 ? (
        <CardGrid>
          <EmptyStateCard
            label="No datasets yet. Create your first one."
            onCreateClick={() => navigate('/datasets?isCreate=true')}
          />
        </CardGrid>
      ) : (
        <CardGrid>
          {datasets.map((ds) => (
            <DatasetCard
              key={ds.id}
              data={ds}
              onClick={() => navigate(`/dataset/dataset/${ds.id}`)}
            />
          ))}
          <SeeAllCard href="/datasets" />
        </CardGrid>
      )}
    </Box>
  );
};
