import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Crew({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 9a4.5 4.5 0 0 0-4.5 4.5v.5c0 1.971 1.86 4 5.25 4 1.47 0 2.64-.364 3.5-.901A6.989 6.989 0 0 1 9 13.5V13A4.5 4.5 0 0 0 6 9Zm12 0a4.5 4.5 0 0 1 4.5 4.5v.5c0 1.971-1.86 4-5.25 4-1.47 0-2.64-.364-3.5-.901A6.989 6.989 0 0 0 15 13.5V13A4.5 4.5 0 0 1 18 9Zm-6-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-4.5 7.5A3 3 0 0 1 12 10.5a3 3 0 0 1 3 3v.5c0 2.485-2.232 5-6 5s-6-2.515-6-5v-.5a3 3 0 0 1 3-3h4.5Z"
        fill={color}
      />
    </Svg>
  );
}
