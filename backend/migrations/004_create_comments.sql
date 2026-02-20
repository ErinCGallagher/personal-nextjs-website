CREATE TYPE comment_status AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug         TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  parent_id         UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(anonymous_id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  status            comment_status NOT NULL DEFAULT 'Pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_updated_at TIMESTAMPTZ,
  status_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
