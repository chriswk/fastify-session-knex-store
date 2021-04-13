// Update with your config settings.

module.exports = {
  local: {
    client: "postgresql",
    connection: "postgresql://knex:password@localhost:5432/session"
  },

  postgres: {
    client: "postgresql",
    connection: "postgresql://postgresql:postgresql@localhost:5432/postgres"
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
