CREATE TABLE IF NOT EXISTS users (
  anonymous_id UUID PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
