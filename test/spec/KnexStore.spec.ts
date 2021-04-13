import { DEFAULT_PREFIX, KnexStore } from 'src/KnexStore';
import Knex from 'knex';
import { pathToFileURL } from 'node:url';
import { dir } from 'node:console';
import path from 'path';
import { dirname } from 'node:path';

const DB_URL = process.env.DB_URL || 'postgresql://knex:password@localhost:5432/session';
const DB_CLIENT = process.env.DB_CLIENT || 'pg';

describe('KnexStore Postgres', () => {
    const knex = Knex({
        client: DB_CLIENT,
        connection: DB_URL,
    });

    const store = new KnexStore({ client: knex, ttl: 12e3 });
    const context = new Map<string, any>([
        ['id', 'QLwqf4XJ1dmkiT41RB0fM'],
        ['data', { foo: 'bar' }],
        ['expiry', Date.now() + 6e3],
    ]);

    afterAll(async () => {
        await knex.table('sessions').del();
        await knex.destroy();
    });

    it('should properly set a key', async () => {
        const result = await store.set(context.get('id'), context.get('data'), context.get('expiry'));
        expect(result).toBeUndefined();
        const sessionData = await knex
            .table('sessions')
            .select('*')
            .where({ key: `${DEFAULT_PREFIX}${context.get('id')}` })
            .first();
        expect(sessionData.data).toEqual(context.get('data'));
        expect(typeof sessionData.expiry).toBe('string');
    });
    it('should properly get a key', async () => {
        const result = await store.get(context.get('id'));
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result![0]).toEqual(context.get('data'));
        expect(result![1]).toEqual(context.get('expiry').toString());
    });

    it('should properly destroy a key', async () => {
        const result = await store.destroy(context.get('id'));
        expect(result).toBeUndefined();
        const result2 = await store.get(context.get('id'));
        expect(result2).toBeNull();
    });

    it('should properly touch a key', async () => {
        await store.set(context.get('id'), context.get('data'), context.get('expiry'));
        await waitFor(1000);
        const result = await store.touch(context.get('id'));
        expect(result).toBeUndefined();
        const updated = await knex
            .table('sessions')
            .select('expiry')
            .where({ key: `${DEFAULT_PREFIX}${context.get('id')}` })
            .first();
        expect(updated).toBeDefined();
        expect(Number.parseInt(updated.expiry)).toBeGreaterThan(context.get('expiry'));
    });  
});

const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
