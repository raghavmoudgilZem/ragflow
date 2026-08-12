import React, { memo } from 'react';

export interface BaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const BaseIconComponent: React.FC<
  React.PropsWithChildren<BaseIconProps>
> = ({
  size = 24,
  width = size,
  height = size,
  children,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

export const BaseIcon = memo(BaseIconComponent);