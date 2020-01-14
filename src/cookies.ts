import { TParseOpts, TJar, TSerializeOpts } from './types';
import { parse, serialize } from './utils';

function isBrowser() {
  return typeof document === 'object' && typeof document.cookie === 'string';
}

export class CookieJar {
  jar: TJar = {};
  ignoreDocument: boolean = false;

  constructor(cookies?: string | object, opts?: TParseOpts) {
    if (typeof cookies === 'string') {
      this.jar = parse(cookies, opts);
      return;
    }

    // typeof null === 'object'
    if (cookies !== null && typeof cookies === 'object') {
      this.jar = cookies;
      return;
    }
  }

  get(name?: string, opts?: TParseOpts): TJar | undefined {
    if (isBrowser() && !this.ignoreDocument) {
      this.jar = parse(document.cookie, opts);
    }

    if (name) {
      return this.jar[name];
    }

    return this.jar;
  }

  set(name: string, value: any, opts?: TSerializeOpts) {
    if (typeof value === 'object') {
      try {
        value = JSON.stringify(value);
      } catch (e) {
        throw new TypeError('argument val is invalid');
      }
    }

    const { str, obj } = serialize(name, value, opts);

    if (isBrowser() && !this.ignoreDocument) {
      document.cookie = str;
    }

    this.jar = { ...this.jar, ...obj };
    return str;
  }

  remove(name: string, opts?: TSerializeOpts) {
    const deleteOptions = {
      ...opts,
      expires: new Date(1970, 1, 1, 0, 0, 1),
      maxAge: 0,
    };

    if (isBrowser() && !this.ignoreDocument) {
      const { str } = serialize(name, '', deleteOptions);
      document.cookie = str;
    }

    delete this.jar[name];
  }
}
