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
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT unique_tournaments_name UNIQUE (name)
            )

            CREATE TABLE phases (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(30) NOT NULL,
                description VARCHAR(1000),
                tournament_id BIGINT,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
            )

            CREATE TABLE stages (
                id BIGSERIAL PRIMARY KEY,
                phase_id BIGINT,
                tournament_id BIGINT,
                name VARCHAR(30) NOT NULL,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
                CONSTRAINT phase_id_fk FOREIGN KEY(phase_id) REFERENCES phases(id)
            )

            CREATE TABLE tours (
                id BIGSERIAL PRIMARY KEY,
                name: VARCHAR(30) NOT NULL,
                position: NUMERIC NOT NULL,
                stage_id: VARCHAR(30) NOT NULL,
                tournament_id: VARCHAR(30) NOT NULL,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT unique_stages_name UNIQUE (name),
                CONSTRAINT stage_id_fk FOREIGN KEY(stage_id) REFERENCES stages(id),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
            )

            CREATE TABLE games (
                id BIGSERIAL PRIMARY KEY,
                tour SMALLINT NOT NULL,
                tournament_id BIGINT,
                phase_id BIGINT,
                stage_id BIGINT,
                description VARCHAR(1000),
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
                CONSTRAINT phase_id_fk FOREIGN KEY(phase_id) REFERENCES phases(id),
                CONSTRAINT stage_id_fk FOREIGN KEY(stage_id) REFERENCES stages(id)
            )

            CREATE TABLE teams (
                id BIGSERIAL PRIMARY KEY,
                score SMALLINT,
                tournament_id BIGINT,
                img VARCHAR(1000),
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
            )

            CREATE TABLE team_stage (
                id BIGSERIAL PRIMARY KEY,
                team_id BIGINT,
                stage_id BIGINT,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT team_id_fk FOREIGN KEY(team_id) REFERENCES teams(id),
                CONSTRAINT stage_id_fk FOREIGN KEY(stage_id) REFERENCES stages(id)
            )

            CREATE TABLE team_game (
                id BIGSERIAL PRIMARY KEY,
                team_id BIGINT,
                game_id BIGINT,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT team_id_fk FOREIGN KEY(team_id) REFERENCES teams(id),
                CONSTRAINT game_id_fk FOREIGN KEY(game_id) REFERENCES games(id)
            )

            CREATE TABLE players (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(30) NOT NULL,
                description VARCHAR(1000),
                url: VARCHAR(1000),
                img VARCHAR(1000),
                team_id BIGINT,
                tournament_id BIGINT,
                created_at NUMERIC(30) NOT NULL,
                updated_at NUMERIC(30),
                CONSTRAINT tournament_id_fk FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
                CONSTRAINT team_id_fk FOREIGN KEY(team_id) REFERENCES teams(id),
                CONSTRAINT unique_players_name UNIQUE (name)
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