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
// → '{ my-cookie: "a value" }'

// Get all cookies currently in the jar
jar.get();
// → '{ my-cookie: "a value", my-second-cookie: "another value" }'

// Remove a cookie by name
jar.remove('my-cookie');
```

### Create a pre-filled jar of cookies

You can pre-fill a cookie jar by passing in a valid cookie string.  
This is useful when dealing with cookies coming from a HTTP request object.

```js
export default (req, res) => {
  // req.headers.cookie ≙ 'my-cookie=value'
  const jar = new CookieJar(req.headers.cookie);
  const cookies = jar.get();
  // → '{ my-cookie: "value" }'
  ...
}
```

## API

TBD

---

This project was bootstrapped with [jvdx](https://github.com/joelvoss/jvdx).

[@cookie]: https://github.com/jshttp/cookie
[@js-cookie]: https://github.com/js-cookie/js-cookie
