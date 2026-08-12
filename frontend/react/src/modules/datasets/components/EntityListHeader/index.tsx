/**
 * @author Shruthi
 * @description Reusable page-level header used by Dataset, Chat, Search, Agent pages.
 */

import React, { memo } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material';
import {
  Add,
  FilterAlt,
  Search,
} from '@mui/icons-material';

import {
  createButtonStyles,
  filterButtonStyles,
  iconStyles,
  leftSectionStyles,
  rightSectionStyles,
  rootStyles,
  searchContainerStyles,
  searchInputStyles,
  titleStyles,
} from './index.styles';

export interface EntityListHeaderProps {
  icon: React.ReactNode;
  title: string;
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onFilterClick: (e: React.MouseEvent<HTMLElement>) => void;
  createLabel: string;
  onCreateClick: () => void;
  showFilter?: boolean;
}

const EntityListHeader: React.FC<EntityListHeaderProps> = ({
  icon,
  title,
  searchValue,
  searchPlaceholder = 'Search',
  onSearchChange,
  onFilterClick,
  createLabel,
  onCreateClick,
  showFilter = true,
}) => (
  <Box
    sx={rootStyles}
    data-testid="entity-list-header"
  >
    <Box sx={leftSectionStyles}>
      <Box
        component="span"
        aria-hidden
        sx={iconStyles}
      >
        {icon}
      </Box>

      <Typography
        component="h1"
        sx={titleStyles}
      >
        {title}
      </Typography>
    </Box>

    <Box sx={rightSectionStyles}>
      {showFilter && (
        <IconButton
          sx={filterButtonStyles}
          data-testid="entity-list-filter-button"
          onClick={onFilterClick}
          aria-label={`filter ${title}`}
          size="small"
        >
          <FilterAlt fontSize="small" />
        </IconButton>
      )}

      <Box sx={searchContainerStyles}>
        <Search aria-hidden />

        <InputBase
          sx={searchInputStyles}
          data-testid="entity-list-search-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          inputProps={{
            'aria-label': `search ${title}`,
          }}
        />
      </Box>

      <Button
        sx={createButtonStyles}
        data-testid="entity-list-create-button"
        variant="contained"
        startIcon={<Add />}
        onClick={onCreateClick}
        disableElevation
      >
        {createLabel}
      </Button>
    </Box>
  </Box>
);

export default memo(EntityListHeader);