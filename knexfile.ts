// Update with your config settings.

module.exports = {

  development: {
    client: "postgresql",
    connection: {
      database:'postgres',
      user: 'postgres',
      password: 'postgres'
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  local: {
    client: "postgresql",
    connection: "postgresql://knex:password@localhost:5432/session"
  },

  sqlite3: {
    client: "sqlite3",
    connection: {
      filename: "unleashsql.sqlite"
    }
  },

  mysql: {
    client: "mysql2",
    connection: "mysql://knex:password@localhost:5562/fastify_session?charset=utf8"
  }
};
