import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('sessions', (table) => {
        table.text('key').primary().notNullable();
        table.jsonb('data').notNullable();
        table.bigInteger('expiry').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('sessions');
}

