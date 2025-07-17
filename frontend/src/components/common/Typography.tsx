// frontend/src/components/common/Typography.tsx
import React, { FC, ReactNode } from 'react';

type Variant = '24' | '22' | '20' | '17' | '15' | '13'; // Sizes as strings for direct mapping
type Weight = 'extralight' | 'light' | 'regular';
type Element = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

interface TypographyProps {
  variant: Variant;
  weight?: Weight;
  element?: Element;
  children: ReactNode;
  className?: string; // For extra Tailwind classes (e.g., 'text-center')
}

const sizeMap: Record<Variant, string> = {
  '24': 'text-[24px]',
  '22': 'text-[22px]',
  '20': 'text-[20px]',
  '17': 'text-[17px]',
  '15': 'text-[15px]',
  '13': 'text-[13px]',
};

const weightMap: Record<Weight, string> = {
  extralight: 'font-extralight', // 200
  light: 'font-light', // 300
  regular: 'font-normal', // 400
};

const Typography: FC<TypographyProps> = ({ variant, weight = 'regular', element = 'p', children, className = '' }) => {
  const sizeClass = sizeMap[variant];
  const weightClass = weightMap[weight];

  return React.createElement(element, {
    className: `${sizeClass} ${weightClass} leading-tight font-exo ${className}`,
  }, children);
};

export default Typography;