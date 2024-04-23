require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

console.log(pool);

(async () => {
    let client;
    try {
        client = await pool.connect();
    } catch (err) {
        console.log('Error connecting to DB for setup: ', err);
    }

    try {
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE tournaments (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(30) NOT NULL,
                description VARCHAR(20000),
                data VARCHAR (99999),
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT unique_tournaments_name UNIQUE (name)
            )

            CREATE TABLE users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(30),
                email: VARCHAR(70),
                password: VARCHAR(1000),
                phone: VARCHAR(50),
                vk_url: VARCHAR(1000),
                img: VARCHAR(1000),
                country: VARCHAR(100),
                setting_id: BIGINT,
                role_id: BIGINT,
                reg_date NUMERIC(30) NOT NULL,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT role_id_fk FOREIGN KEY(role_id) REFERENCES roles(id),
                CONSTRAINT setting_id_fk FOREIGN KEY(setting_id) REFERENCES settings(id),
                CONSTRAINT unique_users_name UNIQUE (name),
                CONSTRAINT unique_users_email UNIQUE (email),
                CONSTRAINT unique_users_password UNIQUE (password)
            )
            
            CREATE TABLE roles (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(30) NOT NULL,
                can_edit_settings BOOLEAN NOT NULL,
                can_edit_games BOOLEAN NOT NULL,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT unique_roles_name UNIQUE (name)
            );
        `);
    } catch (err) {
        console.log('Error setting up a database:', err);
    }
})()