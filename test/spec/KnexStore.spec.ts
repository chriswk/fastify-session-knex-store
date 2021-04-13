import { DEFAULT_PREFIX, KnexStore } from 'src/KnexStore';
import Knex from 'knex';
import * as crypto from 'crypto';
import * as faker from 'faker';
const DB_URL = process.env.DATABASE_URL || 'postgresql://knex:password@localhost:5432/session';
const DB_CLIENT = process.env.DATABASE_CLIENT || 'pg';

const getId = () => faker.datatype.uuid();

describe('KnexStore', () => {
    const knex = Knex({
        client: DB_CLIENT,
        connection: DB_URL,
    });

    const store = new KnexStore({ client: knex, ttl: 12e3 });
    const context = new Map<string, any>([
        ['data', { foo: 'bar' }],
        ['expiry', Date.now() + 6e3],
    ]);

    afterAll(async () => {
        await knex.table('sessions').del();
        await knex.destroy();
    });

    it('should properly set a key', async () => {
        const id = getId();
        const result = await store.set(id, context.get('data'), context.get('expiry'));
        expect(result).toBeUndefined();
        const sessionData = await knex
            .table('sessions')
            .select('*')
            .where({ key: `${DEFAULT_PREFIX}${id}` })
            .first();
        let dataObj;
        if (typeof sessionData.data === 'string') {
            dataObj = JSON.parse(sessionData.data);
        } else {
            dataObj = sessionData.data;
        }
        expect(dataObj).toEqual(context.get('data'));
        expect(sessionData.expiry).toBeDefined();
        if (typeof sessionData.expiry === 'number') {
            expect(sessionData.expiry).toEqual(context.get('expiry'));
        }
    });
    it('should properly get a key', async () => {
        const id = getId();
        const expectedExpiry = Date.now() + 6e4;
        await store.set(id, context.get('data'), expectedExpiry);
        const result = await store.get(id);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result![0]).toEqual(context.get('data'));
        expect(dateFromExpiry(result![1] || 0)).toBeGreaterThanOrEqual(context.get('expiry'));
    });

    it('should properly destroy a key', async () => {
        const id = getId();
        await store.set(id, context.get('data'), context.get('expiry'));
        const result = await store.destroy(id);
        expect(result).toBeUndefined();
        const result2 = await store.get(id);
        expect(result2).toBeNull();
    });

    it('should properly touch a key', async () => {
        const id = getId();
        await store.set(id, context.get('data'), context.get('expiry'));
        await waitFor(1000);
        const result = await store.touch(id);
        expect(result).toBeUndefined();
        const updated = await knex
            .table('sessions')
            .select('expiry')
            .where({ key: `${DEFAULT_PREFIX}${id}` })
            .first();
        expect(updated).toBeDefined();
        if (typeof updated.expiry === 'string') {
            expect(dateFromExpiry(updated.expiry)).toBeGreaterThan(context.get('expiry'));
        } else {
            expect(updated.expiry).toBeGreaterThan(context.get('expiry'));
        }
    });
});

const dateFromExpiry = (expiry: number) => { const d = new Date(); d.setMilliseconds(expiry); return d.getTime() }

const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
