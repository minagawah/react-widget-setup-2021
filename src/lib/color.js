import { compose, tap } from 'ramda';
import { is_str, is_arr, validate_str } from './utils';

export const rgb_average = (rgb = []) => {
  const arr = rgb.slice(0, rgb.length - 1);
  return arr.reduce((a, b) => a + b) / arr.length;
};

// Check if it is dark.
export const is_rgb_dark = rgb => is_arr(rgb) && rgb_average(rgb) < 128;

export const is_pound_hex = val => is_str(val) && val[0] === '#';

export const is_str_rgb = val => is_str(val) && val.indexOf('rgb') === 0;

// 2105376 --> 202020 (or, 0x202020 --> 202020)
export const dec_to_hex = dec => dec.toString(16);

export const hex_to_dec = hex => parseInt(hex, 16);

export const pound_hex_to_dec = compose(
  hex_to_dec,
  (s = '') => s.slice(1),
  validate_str
);

export const zero_x_hex_to_dec = compose(hex_to_dec, s => s | 0);

export const str_rgb_to_rgb = str => {
  str = validate_str(str);

  const m = str.match(
    new RegExp(
      '^rgba{0,1}\\(([0-9]+), ([0-9]+), ([0-9]+).*(:?, ([\\d\\.]+))?\\)'
    )
  );

  const rgb = m
    ? m
        .slice(1)
        .map(Math.trunc)
        .filter(n => !isNaN(n))
    : [0, 0, 0];

  if (rgb.length < 4) {
    rgb.push(1);
  }

  return rgb;
};

export const hex_to_rgb = (hex, alpha = 1) => {
  const rgb = [];

  // eslint-disable no-bitwise
  rgb[0] = (hex >> 16) & 0xff;
  rgb[1] = (hex >> 8) & 0xff;
  rgb[2] = hex & 0xff;
  // eslint-enable no-bitwise

  alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;

  if (alpha === 1) {
    rgb[3] = alpha;
  }
  return rgb;
};

export const pound_hex_to_rgb = compose(hex_to_rgb, pound_hex_to_dec);

export const rgb_to_hsl = (rgb = []) => {
  let [r, g, b] = rgb;

  console.log(`[lib/color] [R] ${r} [G] ${g} [B] ${b}`);

  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
};

export const hex_to_hsl = compose(rgb_to_hsl, hex_to_rgb);

export const hsl_to_rgb = (hsl = []) => {
  const h = hsl[0];
  let s = hsl[1];
  let l = hsl[2];

  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  console.log(`[lib/color] [R] ${r} [G] ${g} [B] ${b}`);

  return [r, g, b];
};

export const rgb_to_pound_hex = (rgb = []) => {
  let [r, g, b] = rgb;

  let hexR = r.toString(16);
  let hexG = g.toString(16);
  let hexB = b.toString(16);

  if (hexR.length === 1) {
    hexR = `0${hexR}`;
  }

  if (hexG.length === 1) {
    hexG = `0${hexG}`;
  }

  if (hexB.length == 1) {
    hexB = `0${hexB}`;
  }

  return `#${hexR}${hexG}${hexB}`;
};

export const hsl_to_str = compose(rgb_to_pound_hex, hsl_to_rgb);
