import { SessionData, SessionStore } from '@mgcrea/fastify-session';
import { EventEmitter } from 'events';
import { Knex } from 'knex';

export type KnexStoreOptions = { client: Knex, table?: string, prefix?: string, ttl?: number };

export const DEFAULT_PREFIX = 'sess:';
export const DEFAULT_TTL = 86_400_000; // One day in ms
export const DEFAULT_TABLE = 'sessions';

export interface SessionTable {
    key: string;
    data: SessionData;
    expiry?: number;
}

export class KnexStore<T extends SessionData = SessionData> extends EventEmitter implements SessionStore {
    private knex: Knex;
    private readonly prefix: string;
    private readonly ttl: number;
    private readonly table: string;

    constructor({ client, table = DEFAULT_TABLE, prefix = DEFAULT_PREFIX, ttl = DEFAULT_TTL }: KnexStoreOptions) {
        super();
        this.knex = client;
        this.prefix = prefix;
        this.ttl = ttl;
        this.table = table;
        setInterval(() => {
            this.deleteExpired();
        }, 5*60*1000).unref() // Delete expired sessions every 5 minutes
    }

    private getKey(sessionId: string): string {
        return `${this.prefix}${sessionId}`;
    }

    async set(sessionId: string, sessionData: T, expiry?: number | null): Promise<void> {
        const newExpiry = expiry ? expiry : Date.now() + this.ttl;
        const key = this.getKey(sessionId);
        await this.knex.table(this.table).insert({
            key,
            data: JSON.stringify(sessionData),
            expiry: newExpiry,
        }).onConflict('key').merge();
        return;
    }

    async get(sessionId: string): Promise<[SessionData, number | null] | null> {
        const key = this.getKey(sessionId);
        const row = await this.knex.table<SessionTable>(this.table).where({ key }).first();
        return row ? [row.data, row.expiry as number || null] : null;
    }

    async destroy(sessionId: string): Promise<void> {
        const key = this.getKey(sessionId);
        await this.knex.table(this.table).where({ key }).del();
        return;
    }

    async touch(sessionId: string, expiry?: number | null): Promise<void> {
        const key = this.getKey(sessionId);
        const newExpiry = expiry ? expiry : Date.now() + this.ttl;
        await this.knex.table(this.table).update({
            expiry: newExpiry
        }).where({ key });
        return;
    }

    async deleteExpired(): Promise<void> {
        await this.knex<SessionTable>(this.table).where('expiry', '<', Date.now()).del();
    }
}