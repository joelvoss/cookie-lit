import { describe, expect, test, vi} from 'vitest';
import { serialize, parse, isBrowser } from '../src/utils';

describe('isBrowser()', () => {	
	test('detects a browser environment', () => {
		// @ts-expect-error modify global object
		global.document = {
			cookie: 'cookie string'
		};
		expect(isBrowser()).toBe(true);

		// @ts-expect-error modify global object
		global.document = {};
		expect(isBrowser()).toBe(false);
		
		// @ts-expect-error modify global object
		global.document = undefined;
		expect(isBrowser()).toBe(false);
	})
})

describe('serialize()', () => {
	test('creates a basic cookie string', () => {
		expect(serialize('test', 'value')).toEqual({
			str: 'test=value',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value another')).toEqual({
			str: 'test=value%20another',
			obj: { test: 'value%20another' },
		});
		expect(serialize('test', '')).toEqual({ str: 'test=', obj: { test: '' } });
	});

	test('throws on invalid names', () => {
		expect(() => serialize('test\n', 'value')).toThrowError(
			'argument name is invalid',
		);
		expect(() => serialize('test\u280a', 'value')).toThrowError(
			'argument name is invalid',
		);
	});

	test('creates a basic cookie string with an unencoded value', () => {
		expect(serialize('test', '- ', { encode: v => v })).toEqual({
			str: 'test=- ',
			obj: { test: '- ' },
		});
	});

	test('throws on unencoded and invalid values', () => {
		expect(() => serialize('test', 'value\n', { encode: v => v })).toThrowError(
			'argument val is invalid',
		);
	});

	test('throws on invalid encode option', () => {
		// @ts-expect-error test throw
		expect(() => serialize('test', 'value', { encode: 1 })).toThrowError(
			'option encode is invalid',
		);
	});

	test('creates a cookie string with a `domain` option set', () => {
		expect(serialize('test', 'value', { domain: 'cookie-lit.com' })).toEqual({
			str: 'test=value; Domain=cookie-lit.com',
			obj: { test: 'value' },
		});
	});
	test('throws on invalid `domain` option', () => {
		expect(() =>
			serialize('test', 'value', { domain: 'cookie-lit.com\n' }),
		).toThrowError('option domain is invalid');
	});

	test('creates a cookie string with a `path` option set', () => {
		expect(serialize('test', 'value', { path: '/' })).toEqual({
			str: 'test=value; Path=/',
			obj: { test: 'value' },
		});
	});
	test('throws on invalid `path` option', () => {
		expect(() => serialize('test', 'value', { path: '/\n' })).toThrowError(
			'option path is invalid',
		);
	});

	test('creates a cookie string with a `expires` option set', () => {
		const realDateNow = Date.now.bind(global.Date);
		const dateNowStub = vi.fn(() => 1578775780597);
		global.Date.now = dateNowStub;

		expect(serialize('test', 'value', { expires: 1 })).toEqual({
			str: 'test=value; Expires=Sun, 12 Jan 2020 20:49:40 GMT',
			obj: { test: 'value' },
		});

		global.Date.now = realDateNow;

		expect(
			serialize('test', 'value', {
				expires: new Date(Date.UTC(2020, 1, 11, 12, 0, 0, 0)),
			}),
		).toEqual({
			str: 'test=value; Expires=Tue, 11 Feb 2020 12:00:00 GMT',
			obj: { test: 'value' },
		});
	});

	test('throws on invalid `expires` option', () => {
		// @ts-expect-error test throw
		expect(() => serialize('test', 'value', { expires: '1' })).toThrowError(
			'option expires is invalid',
		);

		expect(() =>
			serialize('test', 'value', { expires: Date.now() }),
		).toThrowError('option expires is invalid');
	});

	test('creates a cookie string with a `maxAge` option set', () => {
		expect(serialize('test', 'value', { maxAge: 10 })).toEqual({
			str: 'test=value; Max-Age=10',
			obj: { test: 'value' },
		});
		// @ts-expect-error test throw
		expect(serialize('test', 'value', { maxAge: '10' })).toEqual({
			str: 'test=value; Max-Age=10',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { maxAge: 0 })).toEqual({
			str: 'test=value; Max-Age=0',
			obj: { test: 'value' },
		});
		// @ts-expect-error test throw
		expect(serialize('test', 'value', { maxAge: '0' })).toEqual({
			str: 'test=value; Max-Age=0',
			obj: { test: 'value' },
		});
		// @ts-expect-error test throw
		expect(serialize('test', 'value', { maxAge: null })).toEqual({
			str: 'test=value',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { maxAge: undefined })).toEqual({
			str: 'test=value',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { maxAge: 1.2 })).toEqual({
			str: 'test=value; Max-Age=1',
			obj: { test: 'value' },
		});
	});
	test('throws on invalid `maxAge` option', () => {
		expect(() =>
			// @ts-expect-error test throw
			serialize('test', 'value', { maxAge: 'not-a-number' }),
		).toThrowError('option maxAge is invalid');
	});

	test('creates a cookie string with a `httpOnly` option set', () => {
		expect(serialize('test', 'value', { httpOnly: true })).toEqual({
			str: 'test=value; HttpOnly',
			obj: { test: 'value' },
		});
		// @ts-expect-error test throw
		expect(serialize('test', 'value', { httpOnly: 'true' })).toEqual({
			str: 'test=value; HttpOnly',
			obj: { test: 'value' },
		});
	});

	test('creates a cookie string with a `secure` option set', () => {
		expect(serialize('test', 'value', { secure: true })).toEqual({
			str: 'test=value; Secure',
			obj: { test: 'value' },
		});
		// @ts-expect-error test throw
		expect(serialize('test', 'value', { secure: 'true' })).toEqual({
			str: 'test=value; Secure',
			obj: { test: 'value' },
		});
	});

	test('creates a cookie string with a `sameSite` option set', () => {
		expect(serialize('test', 'value', { sameSite: true })).toEqual({
			str: 'test=value; SameSite=Strict',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { sameSite: false })).toEqual({
			str: 'test=value',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { sameSite: 'Strict' })).toEqual({
			str: 'test=value; SameSite=Strict',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { sameSite: 'strict' })).toEqual({
			str: 'test=value; SameSite=Strict',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { sameSite: 'lax' })).toEqual({
			str: 'test=value; SameSite=Lax',
			obj: { test: 'value' },
		});
		expect(serialize('test', 'value', { sameSite: 'none' })).toEqual({
			str: 'test=value; SameSite=None',
			obj: { test: 'value' },
		});
	});
	test('throws on invalid `sameSite` option', () => {
		expect(() =>
			serialize('test', 'value', { sameSite: 'invalid' }),
		).toThrowError('option sameSite is invalid');
	});
});

describe('parse()', () => {
	test('parses a basic cookie string', () => {
		expect(parse('test=value')).toEqual({
			test: 'value',
		});
		expect(parse('test=1')).toEqual({
			test: '1',
		});
		expect(parse('test-value')).toEqual({});
	});

	test('throws on invalid str argument', () => {
		// @ts-expect-error test throw
		expect(() => parse(1)).toThrowError('argument str is invalid');
		// @ts-expect-error test throw
		expect(() => parse()).toThrowError('argument str is invalid');
	});

	test('ignores spaces inside the input string', () => {
		expect(parse('test    = value;   anotherTest  =   anotherValue')).toEqual({
			test: 'value',
			anotherTest: 'anotherValue',
		});
	});

	test('unwraps quoted values', () => {
		expect(parse('test="value"')).toEqual({
			test: 'value',
		});
	});

	test('escapes the input string', () => {
		expect(parse('test=value=1&name=cookie+lit')).toEqual({
			test: 'value=1&name=cookie+lit',
		});
	});

	test('ignores escaping error and return original value', () => {
		expect(parse('test=%1;another-test=value')).toEqual({
			test: '%1',
			'another-test': 'value',
		});
	});

	test('ignores non-values', () => {
		expect(parse('test=%1;another-test=value;HttpOnly;Secure')).toEqual({
			test: '%1',
			'another-test': 'value',
		});
	});

	test('uses injected decode method', () => {
		expect(parse('test="value=1&name=cookie+lit"', { decode: v => v })).toEqual(
			{
				test: 'value=1&name=cookie+lit',
			},
		);
		expect(parse('test=%20%22%2c%3b%2f', { decode: v => v })).toEqual({
			test: '%20%22%2c%3b%2f',
		});
	});

	test('returns date-strings without manipulation', () => {
		expect(parse('test=value; expires=Wed, 29 Jan 2014 17:43:25 GMT')).toEqual({
			test: 'value',
			expires: 'Wed, 29 Jan 2014 17:43:25 GMT',
		});
	});

	test('handles missing values', () => {
		expect(parse('test; test2=1; test3= ; test4=; test5=2')).toEqual({
			test2: '1',
			test3: '',
			test4: '',
			test5: '2',
		});
	});

	test('assignes a key-value-pair only once', () => {
		expect(parse('test=value; anohter-test=value; test=anohter-value')).toEqual(
			{
				test: 'value',
				'anohter-test': 'value',
			},
		);
		expect(parse('test=true; anohter-test=value; test=false')).toEqual({
			test: 'true',
			'anohter-test': 'value',
		});
		expect(parse('test=; anohter-test=value; test=value')).toEqual({
			test: '',
			'anohter-test': 'value',
		});
	});
});
