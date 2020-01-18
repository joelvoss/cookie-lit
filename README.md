# Basic Example

**cookie-lit** is a library for parsing and serialization of server and client
side cookies. It is heavily inspired by [cookie][@cookie] and
[js-cookie][@js-cookie] and tries to combine both projects into one solution.

## Installation

```bash
$ npm install cookie-lit

# Using yarn
$ yarn add cookie-lit
```

## Usage

### Basic

```js
import CookieJar from 'cookie-lit';

// Create a new cookie jar
const jar = new CookieJar();

// Set cookies
jar.set('my-cookie', 'a value');
jar.set('my-second-cookie', 'another value');

// Get a cookie by name
jar.get('my-cookie');
// ➞ '{ "my-cookie": "a value" }'

// Get all cookies currently in the jar
jar.get();
// ➞ '{ "my-cookie": "a value", "my-second-cookie": "another value" }'

// Remove a cookie by name
jar.remove('my-cookie');
```

### Set a cookie with options

```js
import CookieJar from 'cookie-lit';
const jar = new CookieJar();

const cookie = jar.set('my-cookie', 'value', {
  expires: 1,
  secure: true,
});
// ➞ 'my-cookie=value; Expires=Wed, 15 Jan 2020 18:10:22 GMT; Secure'
```

You can read all about the possible options in the [API](#API) chapter.

### Create a pre-filled jar of cookies

You can pre-fill a cookie jar by passing in a valid cookie string.  
This is useful when dealing with cookies coming from a HTTP request object.

```js
export default (req, res) => {
  // req.headers.cookie ≙ 'my-cookie=value'
  const jar = new CookieJar(req.headers.cookie);
  const cookies = jar.get();
  // ➞ '{ "my-cookie": "value" }'
  ...
}
```

###

## API

### new CookieJar(cookies?)

Create a new cookie jar instance. You can pre-fill a cookie jar by passing in a
valid HTTP Cookie header string or object containing cookie key-value pairs.

```js
const jar = new CookieJar('my-cookie=value');
console.log(jar.get()); // '{ "my-cookie": "value" }'
```

```js
const jar = new CookieJar({ my-cookie: 'value' );
console.log(jar.get()) // '{ "my-cookie": "value" }'
```

### jar.set(name, value, options?)

Set a cookie name-value pair. The method will serialize the given pair into a
Set-Cookie header string that is also returned from the method so you can use
it to set a cookie as a HTTP response header.
If called client side, the cookie pair will be added to `document.cookie`
automatically for you.

#### name

The name of the cookie

#### value

The value to set the cookie to. If the value is of type `object`, we call
`JSON.stringify` on it.

#### options

An optional object specifying additional cookie attributes.

##### encode

Us the encode property to specify a function that will be used to encode the
value set by `jar.set()`.
See [RFC6265 Section 4.1.1](https://tools.ietf.org/html/rfc6265#section-4.1.1)
and [RFC6265 Section 6.1](https://tools.ietf.org/html/rfc6265#section-6.1) for
detailed instructions on cookie value best-practices and limitations.

By default, we are using the global `encodeURIComponent` function, which will
encode a string by replacing each instance of certain characters by UTF-8
representations.

##### domain

Specifies the `Domain` Set-Cookie attribute. By default, no domain is set and
most clients will consider the cookie to apply to only the current domain.

```js
jar.set('my-cookie', 'value', { domain: 'my-domain.com' });
// ➞ 'my-cookie=value; Domain=my-domain.com'
```

##### expires

Specifies the `Expires` Set-Cookie attribute. You can either set a specific
`Date` instance or a `Number` that will be interpreted as days from time of
creation.

By default, no expiration date is set. Most clients will consider this a session
cookie and remove the cookie as soon as the browser window is closed.

```js
// Expires one day from creation.
jar.set('my-cookie', 'value', { expires: 1 });
// ➞ 'my-cookie=value; Expires=Mon, 01 Jan 2020 00:00:00 GMT'
```

> _Note_:
> If both `expires` and `maxAge` are set, maxAge takes precedence, but it is
> possible that not all clients obey this rule. So if both are set, they should
> be set to the same date and time.

##### httpOnly

Specifies the `HttpOnly` Set-Cookie attribute. When truthy, the attribute is
set.

```js
jar.set('my-cookie', 'value', { httpOnly: true });
// ➞ 'my-cookie=value; HttpOnly'
```

> _Note_:
> When setting `httpOnly` to true, clients will not allow JavaScript to see
> this cookie.

##### maxAge

Specifies the `Max-Age` Set-Cookie attribute in seconds. The given number will
be converted to an integer by rounding down.

```js
jar.set('my-cookie', 'value', { maxAge: 60 });
// ➞ 'my-cookie=value; Max-Age=60'
```

> _Note_:
> If both `maxAge` and `expires` are set, maxAge takes precedence, but it is
> possible that not all clients obey this rule. So if both are set, they should
> be set to the same date and time.

##### path

Specfies the `Path` Set-Cookie attribute. If the path attribute is omitted, the
client will use the "directory" of the request-uri's path component as the
default value.

```js
jar.set('my-cookie', 'value', { path: '/' });
// ➞ 'my-cookie=value; Path=/'
```

> _Note:_
> Although seemingly useful for isolating cookies between different paths
> within a given host, the Path attribute cannot be relied upon for security.

##### sameSite

Specifies the `SameSite` Set-Cookie attribute. Use one of the following possible
values:

- `true` will set the attribute to "Strict"
- `false` will not set the attribute
- `lax` will set the attribute to "Lax"
- `none` will set the attribute to "None"
- `strict` will set the attribute to "Strict"

```js
jar.set('my-cookie', 'value', { sameSite: true });
// ➞ 'my-cookie=value; SameSite=Strict'
```

> _Note:_
> Browsers are migrating to have cookies default to `SameSite=Lax`. If a cookie
> is needed to be sent cross-origin, opt out of the `SameSite` restriction using
> the `None` directive. The `None` directive requires the `Secure` attribute.

##### secure

Specifies the `Secure` Set-Cookie attribute. When truthy, the attribte is set.

```js
```

> _Note:_
> When setting `secure` to true, complient clients will not send the cookie
> over HTTP and you will not allow JavaScript to see this cookie on
> http://localhost.

### jar.get(name?, options?)

Get all cookie name-value pairs currently stored in the cookie jar.
By specifying the name argument you can query for a specific cookie value.

```js
// document.cookie = 'my-cookie=value'

jar.get();
// ➞ '{ "my-cookie": "value" }'
```

#### name

An optional cookie header name to query a specific cookie value for.

#### options

An optional object specifying additional query options.

##### decode

Specifies a function that will be used to decode a previously-encoded cookie
value into a JavaScript string or object.

By default this function is the global `decodeURIComponent`.

> _Note:_
> If the decode function throws an error, the original value will be returned.

### jar.remove(name, options?)

Delete a cookie from `document.cookie` and the cookie jar.
The method will return an appropriate Set-Cookie header string to remove
the cookie.

```js
jar.set('my-cookie');
// document.cookie = 'my-cookie=value'
// jar.get() = '{ "my-cookie": "value" }'

jar.remove('my-cookie');
// ➞ 'my-cookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0'
// document.cookie = ''
// jar.get() = '{}'
```

#### name

The name of the cookie to be deleted.

#### options

An optional object containing additional cookie attributes.
These attributes must match the attributes set on the cookie to be deleted.

```js
jar.set('my-cookie', 'value', { path: '' });

// This will fail, as the `path` attributes don't match.
jar.remove('my-cookie');

// This will remove the cookie.
jar.remove('my-cookie', { path: '' });
```

> _Note:_
> Removing a non-existent cookie neither raises any exception nor returns any
> value.

---

This project was bootstrapped with [jvdx](https://github.com/joelvoss/jvdx).

[@cookie]: https://github.com/jshttp/cookie
[@js-cookie]: https://github.com/js-cookie/js-cookie
