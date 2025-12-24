--! Previous: -
--! Hash: sha1:0f5812962e9e885fef2c6535ce9b35da79feb0bf
--! Message: User table created

-- Enter migration here
CREATE TYPE role_type AS ENUM ('admin', 'user');

-- 2. Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role role_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
