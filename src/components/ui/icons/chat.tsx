import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Chat({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M7.5 3A4.5 4.5 0 0 0 3 7.5v7A4.5 4.5 0 0 0 7.5 19H9v2.25a.75.75 0 0 0 1.28.53l3.47-3.47a.75.75 0 0 1 .53-.22h2.22a4.5 4.5 0 0 0 4.5-4.5v-7A4.5 4.5 0 0 0 16.5 3h-9Zm9 1.5h-9A3 3 0 0 0 4.5 7.5v7a3 3 0 0 0 3 3H9a.75.75 0 0 1 .75.75v1.19l2.22-2.22a2.25 2.25 0 0 1 1.59-.66h2.94a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3Z"
        fill={color}
      />
    </Svg>
  );
}
