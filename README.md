# FastifySession KnexStore

[![npm version](https://img.shields.io/npm/v/fastify-session-knex-store)](https://github.com/chriswk/fastify-session-redis-store/releases)
[![license](https://img.shields.io/npm/l/fastify-session-knex-store)](https://tldrlegal.com/license/mit-license)
[![build status](https://img.shields.io/github/workflow/status/chriswk/fastify-session-knex-store/ci)](https://github.com/chriswk/fastify-session-knex-store/actions)
[![dependencies status](https://img.shields.io/david/chriswk/fastify-session-knex-store)](https://david-dm.org/chriswk/fastify-session-knex-store)
[![devDependencies status](https://img.shields.io/david/dev/chriswk/fastify-session-knex-store)](https://david-dm.org/chriswk/fastify-session-knex-store?type=dev)

Knex session store for [fastify](https://github.com/fastify/fastify).

- Requires [@mgcrea/fastify-session](https://github.com/mgcrea/fastify-session) to handle sessions.

- Relies on [knex](https://knexjs.org) to interact with database of your choice.

- Built with [TypeScript](https://www.typescriptlang.org/) for static type checking with exported types along the
  library.

## Usage

```bash
npm install @chriswk/fastify-session-knex-store
```

```bash
npm install knex --save
# or
yarn add knex
```

Also you'll need to install knex adapter of your choice. Refer to [Knex docs](http://knexjs.org/#Installation-node)

```ts
import createFastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyCookie from 'fastify-cookie';
import KnexStore from '@chriswk/fastify-session-knex-store';
import fastifySession from '@mgcrea/fastify-session';
import { IS_PROD, IS_TEST, REDIS_URI, SESSION_TTL } from './config/env';

const SESSION_TTL = 864e3; // 1 day in seconds

export const buildFastify = (options?: FastifyServerOptions): FastifyInstance => {
  const fastify = createFastify(options);

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    store: new KnexStore({ client: new Knex({
        client: 'pg' // or the other options supported by knex
        connection: {
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_DATABASE
        },
    }), ttl: SESSION_TTL }),
    secret: 'a secret with minimum length of 32 characters',
    cookie: { maxAge: SESSION_TTL },
  });

  return fastify;
};
```

## Development

### Testing

Tests run against a postgres database by default. This needs to be configured in advance. Install knex globally
```bash
yarn global add knex
```

Default postgres database is configured to be `session` with username `knex` and password `password`, if this is already setup, run
```bash
knex migrate:latest
```

from project root folder to setup test database instance.


## Authors

- [Christopher Kolstad](https://github.com/chriswk) <<git@chriswk.no>>

### Credits

- [mcgrea/fastify-session-redis-store](https://github.com/mgcrea/fastify-session-redis-store)

## License

```
The MIT License

Copyright (c) 2021 Christopher Kolstad <git@chriswk.no>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```