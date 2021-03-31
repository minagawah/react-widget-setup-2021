import { css } from '@emotion/react';

import { pound_hex_to_rgb, rgb_to_pound_hex } from '@/lib/color';
import { int, lerp } from '@/lib/math';
import { useDebounce } from '@/hooks/debounce';

const { Fragment, useEffect, useState } = React;

const DEBOUNCE_MSEC = 200;
const NUM_OF_BOX = 25;
const COLOR_BEG = pound_hex_to_rgb('#a00e64');
const COLOR_END = pound_hex_to_rgb('#a02ef0');

const colors = Array(NUM_OF_BOX)
  .fill()
  .map((_, i) => {
    const norm = i / NUM_OF_BOX;
    const rgb = [0, 1, 2].map(i => int(lerp(norm, COLOR_BEG[i], COLOR_END[i])));
    const color = rgb_to_pound_hex(rgb);
    console.log(
      `(widget) [content] [${i}] (${rgb[0]}, ${rgb[1]}, ${rgb[2]}) --> ${color}`
    );
    return color;
  });

export const Content = ({ width }) => {
  const [boxWidth, setBoxWidth] = useState(10);

  const w_debounce = useDebounce(width, DEBOUNCE_MSEC);

  useEffect(() => {
    const w = int(width / NUM_OF_BOX);
    console.log(`(widget) [content] w: ${w}`);
    setBoxWidth(w);
  }, [w_debounce]);

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: flex-start;
        margin-top: 10px;
      `}
    >
      {colors.map(color => (
        <div
          css={css`
            background-color: ${color};
            width: ${boxWidth}px;
            height: 90vh;
          `}
        ></div>
      ))}
    </div>
  );
};
