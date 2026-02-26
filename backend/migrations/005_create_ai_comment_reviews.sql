-- Create AI comment reviews table for tracking AI moderation history
CREATE TABLE IF NOT EXISTS ai_comment_reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id            UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  provider              VARCHAR(50) NOT NULL,
  confidence_score      DECIMAL(3,2),
  flags                 JSONB,
  reasoning             TEXT,
  status                VARCHAR(20) NOT NULL DEFAULT 'completed',
  error_message         TEXT,
  reviewed_at           TIMESTAMPTZ DEFAULT NOW(),
  api_response_time_ms  INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_reviews_comment_id ON ai_comment_reviews(comment_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_status ON ai_comment_reviews(status);

-- Add foreign key to comments table to reference latest AI review
ALTER TABLE comments ADD COLUMN IF NOT EXISTS latest_ai_review_id UUID REFERENCES ai_comment_reviews(id);
