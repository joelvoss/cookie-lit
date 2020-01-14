/**
 * @jest-environment jsdom
 */

import CookieJar from '../index';

function cleanCookies() {
  document.cookie.split(';').forEach(function(c) {
    document.cookie = c
      .trim()
      .replace(/=.*/, '=; expires=Thu, 01 Jan 1970 00:00:01 GMT');
  });
}

describe('CookieJar', () => {
  beforeEach(() => {
    cleanCookies();
  });

  it('returns an empty cookie jar if no cookies are set', () => {
    const jar = new CookieJar();
    expect(jar.get()).toEqual({});
  });

  it('returns a cookie jar (client)', () => {
    document.cookie = 'client=1';
    const jar = new CookieJar();
    expect(jar.get()).toEqual({
      client: '1',
    });
  });

  it('returns a cookie jar (client / after creation)', () => {
    const jar = new CookieJar();
    // We set the cookie after context creation which should also work
    document.cookie = 'client=after';
    expect(jar.get()).toEqual({
      client: 'after',
    });
  });

  it('returns a cookie jar (server)', () => {
    let jar = new CookieJar('server=1');
    jar.ignoreDocument = true;
    expect(jar.get()).toEqual({
      server: '1',
    });

    jar = new CookieJar({ server: 'from-object' });
    jar.ignoreDocument = true;
    expect(jar.get()).toEqual({
      server: 'from-object',
    });
  });

  it('returns a single cookie by name (client)', () => {
    document.cookie = 'client=1';
    document.cookie = 'test=client';
    const jar = new CookieJar();
    expect(jar.get('test')).toEqual('client');
  });

  it('returns a single cookie by name (server)', () => {
    let jar = new CookieJar('server=1; test=server');
    jar.ignoreDocument = true;
    expect(jar.get('test')).toEqual('server');

    jar = new CookieJar({ server: '1', test: 'test-object' });
    jar.ignoreDocument = true;
    expect(jar.get('test')).toEqual('test-object');
  });

  it('returns undefined if a cookie is missing (client)', () => {
    document.cookie = 'client=1';
    document.cookie = 'test=client';
    let jar = new CookieJar();
    expect(jar.get('missing')).toBeUndefined();
  });

  it('returns undefined if a cookie is missing (server)', () => {
    let jar = new CookieJar('server=1; test=server');
    jar.ignoreDocument = true;
    expect(jar.get('missing')).toBeUndefined();

    jar = new CookieJar({ server: '1', test: 'test-object' });
    jar.ignoreDocument = true;
    expect(jar.get('missing')).toBeUndefined();
  });

  it('sets a cookie (client)', () => {
    let jar = new CookieJar();
    const cookieString = jar.set('test', 'value');
    expect(cookieString).toEqual('test=value');

    expect(jar.get()).toEqual({
      test: 'value',
    });
    // jsdom's document.cookie setter prepends "; "
    expect(document.cookie).toEqual('; test=value');
  });

  it('sets a cookie (server)', () => {
    let jar = new CookieJar();
    jar.ignoreDocument = true;
    const cookieString = jar.set('test', 'value');
    expect(cookieString).toEqual('test=value');

    expect(jar.get()).toEqual({
      test: 'value',
    });
    expect(document.cookie).toEqual('');
  });

  it('sets multiple cookies (client)', () => {
    let jar = new CookieJar();
    const cStr0 = jar.set('test', 'value');
    expect(cStr0).toEqual('test=value');

    const cStr1 = jar.set('test2', 'value2');
    expect(cStr1).toEqual('test2=value2');

    const cStr2 = jar.set('test', 'value3');
    expect(cStr2).toEqual('test=value3');

    expect(jar.get()).toEqual({
      test: 'value3',
      test2: 'value2',
    });
    // jsdom's document.cookie setter prepends "; "
    expect(document.cookie).toEqual('; test=value3; test2=value2');
  });

  it('sets multiple cookies (server)', () => {
    let jar = new CookieJar();
    jar.ignoreDocument = true;
    const cStr0 = jar.set('test', 'value');
    expect(cStr0).toEqual('test=value');

    const cStr1 = jar.set('test2', 'value2');
    expect(cStr1).toEqual('test2=value2');

    const cStr2 = jar.set('test', 'value3');
    expect(cStr2).toEqual('test=value3');

    expect(jar.get()).toEqual({
      test: 'value3',
      test2: 'value2',
    });
    expect(document.cookie).toEqual('');
  });

  it('removes a cookie (client)', () => {
    let jar = new CookieJar();
    document.cookie = 'remove=me';
    expect(jar.get()).toEqual({
      remove: 'me',
    });
    // jsdom's document.cookie setter prepends "; "
    expect(document.cookie).toEqual('; remove=me');
    jar.remove('remove');
    expect(jar.get()).toEqual({});
    expect(document.cookie).toEqual('');
  });

  it('removes a cookie (server)', () => {
    let jar = new CookieJar('remove=me');
    jar.ignoreDocument = true;
    expect(jar.get()).toEqual({
      remove: 'me',
    });
    jar.remove('remove');
    expect(jar.get()).toEqual({});
  });
});
