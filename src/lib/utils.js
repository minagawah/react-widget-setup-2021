export const check_type = chk => o => typeof o === chk;
/* alias */ export const checkType = check_type;

export const is_str = check_type('string');
export const is_arr = check_type('array');
export const is_obj = check_type('object');

/* alias */ export const isStr = is_str;
/* alias */ export const isArr = is_arr;
/* alias */ export const isObj = is_obj;

export const custom_validate = chk => o => {
  if (!check_type(chk)(o)) {
    throw new Error(`${o} is not a ${chk}`);
  }
  return o;
};
/* alias */ export const customValidate = custom_validate;

export const validate_str = custom_validate('string');
export const validate_arr = custom_validate('array');
export const validate_obj = custom_validate('object');

/* alias */ export const validateStr = validate_str;
/* alias */ export const validateArr = validate_arr;
/* alias */ export const validateObj = validate_obj;

let reqAnimFrame;
let cancAnimFrame;

let _raf;
export const requestAnimFrame =
  _raf ||
  (() => {
    _raf =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (a) {
        window.setTimeout(a, 1e3 / 60);
      };
    return _raf;
  })();

let _caf;
export const cancelAnimFrame =
  _caf ||
  (() => {
    _caf = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    return _caf;
  })();

export const kebab_to_camel = str =>
  str
    .split('-')
    .map((item, index) =>
      index
        ? `${item.charAt(0).toUpperCase()}${item.slice(1).toLowerCase()}`
        : item.toLowerCase()
    )
    .join('');

export const kebabToCamel = kebab_to_camel; // alias

export const getPixelRatio = ctx => {
  const backingStore =
    (ctx &&
      (ctx.backingStorePixelRatio ||
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio)) ||
    1;

  return (window.devicePixelRatio || 1) / backingStore;
};

export const getElemSize = (el, key) => {
  const cs = el && key && getComputedStyle(el);
  const v = cs && cs.getPropertyValue(key);
  return v && v.slice(0, -2);
};
