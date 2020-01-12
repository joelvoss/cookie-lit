import { ISerialize, IParse } from './types';

export const parse: IParse = function(str, opts = {}) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str is invalid');
  }

  let obj: { [key: string]: any } = {};
  const pairs = str.split(/; */);
  if (!opts.decode) {
    opts.decode = decodeURIComponent;
  }

  for (let pair of pairs) {
    const eqIdx = pair.indexOf('=');

    if (eqIdx === -1) {
      continue;
    }

    const key = pair.substr(0, eqIdx).trim();
    let value = pair.substr(eqIdx + 1, pair.length).trim();

    // remove quotes from quoted values
    if ('"' === value[0]) {
      value = value.slice(1, -1);
    }

    if (obj[key] === undefined) {
      try {
        obj[key] = opts.decode(value);
      } catch (e) {
        obj[key] = value;
      }
    }
  }

  return obj;
};

/**
 * RegExp to match a header field content specified in RFC 7230 sec 3.2
 * @see https://tools.ietf.org/html/rfc7230#section-3.2
 */
// eslint-disable-next-line no-control-regex
const headerFieldRegExp = new RegExp('^[\u0009\u0020-\u007e\u0080-\u00ff]+$');

export const serialize: ISerialize = function(name, val, opts = {}) {
  if (!opts.encode) {
    opts.encode = encodeURIComponent;
  }

  if (typeof opts.encode !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!headerFieldRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  const value = opts.encode(val);

  if (value && !headerFieldRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  let str = `${name}=${value}`;

  if (opts.domain) {
    if (!headerFieldRegExp.test(opts.domain)) {
      throw new TypeError('option domain is invalid');
    }
    str += `; Domain=${opts.domain}`;
  }

  if (opts.path) {
    if (!headerFieldRegExp.test(opts.path)) {
      throw new TypeError('option path is invalid');
    }
    str += `; Path=${opts.path}`;
  }

  if (opts.expires) {
    if (typeof opts.expires === 'number') {
      // 1000*60*60*24 === 864e5 == 1d
      opts.expires = new Date(Date.now() + opts.expires * 864e5);
    }
    const err = new TypeError('option expires is invalid');
    if (typeof opts.expires.toUTCString !== 'function') {
      throw err;
    }
    const expires = opts.expires.toUTCString();
    if (expires === 'Invalid Date') {
      throw err;
    }
    str += `; Expires=${opts.expires.toUTCString()}`;
  }

  if (opts.maxAge != null) {
    const maxAge = +opts.maxAge; // type-conversion
    if (isNaN(maxAge)) throw new Error('option maxAge is invalid');
    str += `; Max-Age=${Math.floor(maxAge)}`;
  }

  if (opts.httpOnly) {
    str += `; HttpOnly`;
  }

  if (opts.secure) {
    str += `; Secure`;
  }

  if (opts.sameSite) {
    const sameSite =
      typeof opts.sameSite === 'string'
        ? opts.sameSite.toLowerCase()
        : opts.sameSite;

    switch (sameSite) {
      case true:
      case 'strict':
        str += `; SameSite=Strict`;
        break;
      case 'lax':
        str += `; SameSite=Lax`;
        break;
      case 'none':
        str += `; SameSite=None`;
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return {
    str,
    obj: { [name]: value },
  };
};
