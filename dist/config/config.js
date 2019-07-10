"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    development: {
        username: 'root',
        password: 'root',
        database: 'graphql',
        port: 8889,
        host: '127.0.0.1',
        dialect: 'mysql'
    },
    test: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'graphql_test',
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        port: process.env.DB_PORT || 8889,
        dialect: 'mysql',
        logging: false
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
};
