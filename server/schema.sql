CREATE EXTENSION if not exists pgcrypto;

CREATE TABLE  if not exists users(
    id uuid primary key DEFAULT gen_random_uuid(),
    username TEXT not null UNIQUE,
    email TEXT not null UNIQUE,
    PASSWORD TEXT not null UNIQUE,
    created_at TIMESTAMP not NULL DEFAULT now()
);

CREATE TABLE if not exists channels(
    id uuid primary key DEFAULT gen_random_uuid(),
    name TEXT not NULL UNIQUE,
    created_at TIMESTAMP not NULL DEFAULT now()
);

CREATE TABLE if not EXISTS messages(
    id uuid primary key DEFAULT gen_random_uuid(),
    user_id uuid not NULL REFERENCES users(id)on delete CASCADE,
    channel_id uuid not NULL REFERENCES channels(id) on delete CASCADE,
    content TEXT not NULL,
    created_at TIMESTAMP not null DEFAULT now()
);