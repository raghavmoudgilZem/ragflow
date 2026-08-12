/**
 * @author Shruthi
 * @description Dataset feature icon — SVG matching the database/stack icon
 *              shown in the Figma designs next to the "Dataset" page title
 *              and in the empty state card.
 */

import React, { memo } from 'react';

import { BaseIcon } from '../../shared/components/common/BaseIconWrapper';

export type DatasetIconProps = React.ComponentProps<typeof BaseIcon>;

const DatasetIconComponent: React.FC<DatasetIconProps> = ({
  color = 'currentColor',
  size = 22,
  ...props
}) => (
  <BaseIcon
    size={size}
    color={color}
    data-testid="dataset-icon"
    aria-hidden
    {...props}
  >
    {/* Top ellipse — lid of the stack */}
    <ellipse
      cx="12"
      cy="5"
      rx="9"
      ry="3"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Left side wall — upper cylinder */}
    <path
      d="M3 5v5c0 1.657 4.03 3 9 3s9-1.343 9-3V5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Left side wall — lower cylinder */}
    <path
      d="M3 10v5c0 1.657 4.03 3 9 3s9-1.343 9-3v-5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Bottom arc — base of the stack */}
    <path
      d="M3 15v4c0 1.657 4.03 3 9 3s9-1.343 9-3v-4"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </BaseIcon>
);

export default memo(DatasetIconComponent);
