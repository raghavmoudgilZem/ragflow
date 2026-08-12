import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import DatasetCardSkeleton from './index';

describe('DatasetCardSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<DatasetCardSkeleton />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render four skeleton placeholders', () => {
    const { container } = render(<DatasetCardSkeleton />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');

    expect(skeletons).toHaveLength(4);
  });

  it('should render a card container', () => {
    const { container } = render(<DatasetCardSkeleton />);

    expect(
      container.querySelector('.MuiCard-root'),
    ).toBeInTheDocument();
  });

  it('should render card content', () => {
    const { container } = render(<DatasetCardSkeleton />);

    expect(
      container.querySelector('.MuiCardContent-root'),
    ).toBeInTheDocument();
  });

  it('should render one circular skeleton', () => {
    const { container } = render(<DatasetCardSkeleton />);

    expect(
      container.querySelector('.MuiSkeleton-circular'),
    ).toBeInTheDocument();
  });

  it('should render three text skeletons', () => {
    const { container } = render(<DatasetCardSkeleton />);

    const textSkeletons = container.querySelectorAll(
      '.MuiSkeleton-text',
    );

    expect(textSkeletons).toHaveLength(3);
  });
});