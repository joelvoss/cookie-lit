import {
	isBrowser,
	parse,
	serialize,
	TJar,
	TParseOpts,
	TSerializeOpts,
} from './utils';

////////////////////////////////////////////////////////////////////////////////

export default class CookieJar {
	jar: TJar = {};
	ignoreDocument = false;

	constructor(cookies?: string | Record<string, unknown>, opts?: TParseOpts) {
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

	get(name?: string, opts?: TParseOpts): TJar | unknown {
		if (isBrowser() && !this.ignoreDocument) {
			this.jar = parse(document.cookie, opts);
		}

		if (name) {
			return this.jar[name];
		}

		return this.jar;
	}

	set(
		name: string,
		value: string | Record<string, unknown>,
		opts?: TSerializeOpts,
	): string {
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

	remove(name: string, opts?: TSerializeOpts): string {
		const deleteOptions = {
			...opts,
			expires: new Date(0),
			maxAge: 0,
		};
		const { str } = serialize(name, '', deleteOptions);

		if (isBrowser() && !this.ignoreDocument) {
			document.cookie = str;
		}

		delete this.jar[name];
		return str;
	}
}
