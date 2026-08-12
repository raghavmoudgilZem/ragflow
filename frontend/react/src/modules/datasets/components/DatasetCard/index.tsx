// pages/datasets/components/DatasetCard/index.tsx
/**
 * @author Shruthi
 */
import React, { memo } from 'react';
import  EntityCard  from '../EntityCard';
import { type IDataset } from '../../types/dataset.types';

interface DatasetCardProps {
  dataset: IDataset;
  isSelected: boolean;
  selectable?: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  avatarColorMap: Record<string, string>; // permission -> color
}

const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  isSelected,
  selectable = false,
  onSelect,
  onRename,
  onDelete,
  avatarColorMap,
}) => (
  <EntityCard
    id={dataset.id}
    title={dataset.name}
    avatarColor={avatarColorMap[dataset.permission]}
    metaLines={[`${dataset.file_count} files`, dataset.updated_at]}
    selectable={selectable}
    isSelected={isSelected}
    onSelect={onSelect}
    actions={[
      { label: 'Rename', onClick: onRename },
      { label: 'Delete', onClick: onDelete },
    ]}
  />
);

export default memo(DatasetCard);