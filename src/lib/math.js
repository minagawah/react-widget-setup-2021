/* eslint camelcase: [0] */
/* eslint no-unused-vars: [1] */

export const int = Math.trunc;

export const rad_to_deg = (rad = 0) => (rad * 180) / Math.PI;
export const deg_to_rad = (deg = 0) => (deg * Math.PI) / 180;

/* alias */ export const radToDeg = rad_to_deg;
/* alias */ export const degToRad = deg_to_rad;

export const rand = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

export const rand_int = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* alias */ export const randInt = rand_int;

export const gen_code4 = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

/**
 * Get the norm for `val` between `min` and `max`.
 * Ex. norm(75, 0, 100) ---> 0.75
 */
export const norm = (val, min, max) => (val - min) / (max - min);

/**
 * Apply `norm` (the linear interpolate value) to the range
 * between `min` and `max` (usually between `0` and `1`).
 * Ex. lerp(0.5, 0, 100) ---> 50
 * @returns {Array|number}
 */
export const lerp = (norm, min, max) => {
  let res;
  if (Array.isArray(min) && Array.isArray(max)) {
    res = [];
    for (let i = 0; i < Math.min(min.length, max.length); i++) {
      res[i] = min[i] * (1.0 - norm) + max[i] * norm;
    }
  } else {
    res = min + (max - min) * norm;
  }
  return res;
};

/**
 * For `val` in the range between `smin` and `smax`,
 * find out the new value if it were mapped
 * to the range between `dmin` and `dmax`.
 * (currently, not used in the main program)
 * Ex. map_norm(50, 0, 100, 0, 10000) ---> 5000
 */
export const map_norm = (val, smin, smax, dmin, dmax) =>
  lerp(norm(val, smin, smax), dmin, dmax);

/* alias */ export const mapNorm = map_norm;

/**
 * Limit the value to a certain range.
 * Ex. clamp(5000, 0, 100) ---> 100
 */
export const clamp = (val, min, max) =>
  Math.min(Math.max(val, Math.min(min, max)), Math.max(min, max));

/**
 * Get a distance between two points.
 */
export const distance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const deg = angle => angle * (180 / Math.PI);
export const rad = angle => angle * (Math.PI / 180);

/**
 * Find the radian from `p2` to `p1`.
 * Ex. deg(angle({ x: 10, y: 10 }, { x: 0, y: 0 })) ---> 45
 */
export const angle = (p1, p2) => Math.atan2(p1.y - p2.y, p1.x - p2.x);

/**
 * See if the value falls within the given range.
 */
export const in_range = (val, min, max) => val >= min && val <= max;

/* alias */ export const inRange = in_range;

/**
 * See if `x` and `y` falls into the bounds made by `rect`.
 */
export const point_in_rect = (x, y, rect) =>
  in_range(x, rect.x, rect.x + rect.width) &&
  in_range(y, rect.y, rect.y + rect.height);

/* alias */ export const pointInRect = point_in_rect;

/**
 * See if the given point falls within the arc's radius.
 */
export const point_in_arc = (p, a) => distance(p, a) <= a.radius;

/* alias */ export const pointInArc = point_in_arc;

/**
 * Merge `props` into `obj`.
 */
export const set_props = (obj, props) => {
  for (let k in props) {
    obj[k] = props[k];
  }
};

/* alias */ export const setProps = set_props;

export const multicurve = (points, ctx) => {
  let p0, p1, midx, midy;
  // For the first in `points`.
  ctx.moveTo(points[0].x, points[0].y);

  // For all except for the first and the last.
  const size = points.length;

  for (let i = 1; i < size - 2; i += 1) {
    p0 = points[i];
    p1 = points[i + 1];
    midx = (p0.x + p1.x) / 2;
    midy = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, midx, midy);
  }

  // For the last in `points`.
  p0 = points[size - 2];
  p1 = points[size - 1];

  ctx.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y);
};

export const ease_in_out_quad = t => {
  return t < 0.5 ? 2.0 * t * t : (4.0 - 2.0 * t) * t - 1.0;
};

/* alias */ export const easeInOutQuad = ease_in_out_quad;

export default {
  rand,
  rand_int,
  randInt,
  norm,
  lerp,
  map_norm,
  mapNorm,
  clamp,
  distance,
  deg,
  rad,
  angle,
  in_range,
  inRange,
  point_in_rect,
  pointInRect,
  point_in_arc,
  pointInArc,
  set_props,
  setProps,
  multicurve,
  ease_in_out_quad,
  easeInOutQuad,
};
