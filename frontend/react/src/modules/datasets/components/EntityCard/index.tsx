/**
 * @author Shruthi
 * @description Generic entity card with avatar, title, meta lines, action menu.
 *              Supports optional checkbox selection for bulk operations.
 *              Reused by DatasetCard, ChatCard, AgentCard, SearchCard.
 */

import React, { memo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import {
  avatarContainerStyles,
  avatarStyles,
  cardContentStyles,
  cardStyles,
  checkboxStyles,
  menuButtonStyles,
  metaLineStyles,
  titleStyles,
  topRowStyles,
} from './index.styles';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EntityCardAction {
  label: string;
  onClick: (id: string) => void;
  testId?: string;
  /** Optional color for destructive actions e.g. Delete */
  color?: string;
}

export interface EntityCardProps {
  id: string;
  title: string;
  /** Background color for the avatar — typically permission-based */
  avatarColor?: string;
  /** Lines displayed below the title, rendered top-to-bottom */
  metaLines: string[];
  actions?: EntityCardAction[];
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const EntityCard: React.FC<EntityCardProps> = ({
  id,
  title,
  avatarColor,
  metaLines,
  actions = [],
  selectable = false,
  isSelected = false,
  onSelect,
  onClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCardClick = () => {
    onClick?.(id);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const getActionTestId = (
    action: EntityCardAction,
    entityId: string,
  ): string =>
    action.testId ??
    `entity-card-${action.label
      .toLowerCase()
      .replace(/\s+/g, '-')}-${entityId}`;

  return (
    <Card
      sx={cardStyles(isSelected)}
      data-testid={`entity-card-${id}`}
      aria-label={title}
      onClick={handleCardClick}
    >
      {selectable && (
        <Checkbox
          sx={checkboxStyles}
          checked={isSelected}
          size="small"
          data-testid={`entity-card-checkbox-${id}`}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onSelect?.(id)}
        />
      )}

      <CardContent sx={cardContentStyles}>
        <Box sx={topRowStyles}>
          <Box sx={avatarContainerStyles}>
            <Avatar
              sx={avatarStyles}
              style={
                avatarColor
                  ? { backgroundColor: avatarColor }
                  : undefined
              }
              alt={`${title} avatar`}
            >
              {title.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {actions.length > 0 && (
            <>
              <IconButton
                sx={menuButtonStyles}
                size="small"
                aria-label="entity actions"
                data-testid={`entity-card-menu-${id}`}
                onClick={handleMenuOpen}
              >
                <MoreVert fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {actions.map((action) => (
                  <MenuItem
                    key={action.label}
                    data-testid={getActionTestId(action, id)}
                    style={
                      action.color
                        ? { color: action.color }
                        : undefined
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      action.onClick(id);
                      setAnchorEl(null);
                    }}
                  >
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>

        <Typography
          component="div"
          sx={titleStyles}
        >
          {title}
        </Typography>

        {metaLines.map((line, index) => (
          <Typography
            key={`${line}-${index}`}
            component="div"
            sx={metaLineStyles}
          >
            {line}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
};

export default memo(EntityCard);