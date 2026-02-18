CREATE TABLE IF NOT EXISTS post_likes (
  anonymous_id UUID NOT NULL,
  post_slug    TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (anonymous_id, post_slug)
);
