# AI Comment Review Implementation - TODO

## Status Legend
- [ ] Not started
- [→] In progress
- [✓] Completed
- [✗] Blocked/skipped

---

## Phase 1: Foundation

- [ ] **Step 1**: Add database schema for AI reviews
  - [ ] Create migration file 005_create_ai_comment_reviews.sql
  - [ ] Create ai_comment_reviews table with all fields (id, comment_id, provider, etc.)
  - [ ] Add indexes on comment_id and status
  - [ ] Add latest_ai_review_id column to comments table
  - [ ] Set up foreign key with CASCADE delete
  - [ ] Run migration on local database
  - [ ] Update TypeScript types in models.ts (add AICommentReview interface, update Comment type)

- [ ] **Step 2**: Set up Gemini API integration
  - [ ] Install @google/generative-ai package
  - [ ] Obtain GEMINI_API_KEY from Google AI Studio
  - [ ] Create gemini-client.ts with client initialization
  - [ ] Implement health check function
  - [ ] Test API connectivity

- [ ] **Step 3**: Design AI review prompt & response schema
  - [ ] Create ai-review-prompt.ts with buildReviewPrompt()
  - [ ] Define review criteria in prompt
  - [ ] Add AIReviewResponseSchema to schemas.ts
  - [ ] Document flag values

---

## Phase 2: Core AI Review Service

- [ ] **Step 4**: Implement AI review service
  - [ ] Create ai-review.ts with reviewComment()
  - [ ] Integrate Gemini API call
  - [ ] Add error handling (timeout, invalid JSON, rate limiting)
  - [ ] Add request logging
  - [ ] Write unit tests

- [ ] **Step 5**: Add database functions for AI review data
  - [ ] Create saveAIReview() function (INSERT into ai_comment_reviews, UPDATE comments.latest_ai_review_id)
  - [ ] Create markAIReviewError() function (INSERT error record)
  - [ ] Create approveComment() function (for AI auto-approval and admin approval)
  - [ ] Create getAIReviewHistory() function
  - [ ] Update getCommentById() to LEFT JOIN ai_comment_reviews
  - [ ] Update getCommentsBySlug() for admin to include AI review data
  - [ ] Use transactions for data consistency
  - [ ] Write integration tests (verify foreign keys, cascade delete, approval)

- [ ] **Step 6**: Integrate AI review into comment submission flow with auto-approval
  - [ ] Update POST /api/posts/:slug/comment handler
  - [ ] Create processCommentReview() orchestration function (include email notification params)
  - [ ] Implement fire-and-forget async pattern
  - [ ] Add auto-approval logic (check confidence >= threshold, call approveComment())
  - [ ] Add email sending AFTER AI review completes:
    - [ ] sendAutoApprovedCommentNotification() if auto-approved
    - [ ] sendPendingCommentNotification() if still pending
  - [ ] Test end-to-end flow (verify auto-approval and correct email sent)

---

## Phase 3: Admin Panel Integration

- [ ] **Step 7**: Update admin API to return AI review data
  - [ ] Modify GET /api/admin/comments to LEFT JOIN ai_comment_reviews
  - [ ] Include AI review fields in response (provider, confidence_score, etc.)
  - [ ] Test API response with and without AI reviews

- [ ] **Step 8**: Update frontend types and API client
  - [ ] Create/update comment.ts with AIReviewData interface (include id, provider, status, etc.)
  - [ ] Extend Comment type to include latestAIReview field
  - [ ] Update api.ts fetchComments() type
  - [ ] Verify TypeScript compilation

- [ ] **Step 9**: Display AI review data in admin panel
  - [ ] Add AI Review section to comment cards
  - [ ] Show provider badge (Gemini, Claude, etc.)
  - [ ] Implement confidence score colour coding with AI recommendations
  - [ ] Display flags as badges
  - [ ] Add expandable reasoning section
  - [ ] Show review status indicators (completed/pending/error)
  - [ ] Display API response time
  - [ ] Add disclaimer that AI is advisory only
  - [ ] Keep approve/reject buttons unchanged (admin can override AI)

---

## Phase 4: Enhanced Notifications (Step 10)

- [ ] **Step 10**: Include AI review in email notifications (pending and auto-approved)
  - [ ] Create sendPendingCommentNotification() function
    - [ ] Email template with AI section (with colour coding)
    - [ ] Link to admin panel for approval
    - [ ] Disclaimer text (admin has final decision)
  - [ ] Create sendAutoApprovedCommentNotification() function
    - [ ] Different subject line and messaging
    - [ ] Show high confidence score
    - [ ] Note that admin can still review/reject
  - [ ] Make AI section conditional (only if aiReview present)
  - [ ] Test both email templates
  - [ ] Note: Email sending happens in processCommentReview() from Step 6

---

## Phase 5: Monitoring & Polish (Steps 11-12)

- [ ] **Step 11**: Add logging and monitoring
  - [ ] Create/update logger.ts
  - [ ] Add structured logging to ai-review.ts
  - [ ] Create monitoring SQL queries
  - [ ] (Optional) Add stats to admin panel

- [ ] **Step 12**: Add configuration and feature flags
  - [ ] Create config.ts with validated env vars (use Zod)
  - [ ] Add env vars: AI_REVIEW_ENABLED, AI_REVIEW_PROVIDER, AI_AUTO_APPROVE_ENABLED, AI_AUTO_APPROVE_THRESHOLD
  - [ ] Validate threshold is 0-1, can't auto-approve without AI review
  - [ ] Update submission flow to check AI_REVIEW_ENABLED
  - [ ] Update processCommentReview() to check AI_AUTO_APPROVE_ENABLED and threshold
  - [ ] Document configuration in README (recommended values, warnings)

---

## Phase 6: Testing & Documentation (Steps 13-14)

- [ ] **Step 13**: Comprehensive testing
  - [ ] Write integration tests for AI review (verify ai_comment_reviews table)
  - [ ] Test auto-approval scenarios:
    - [ ] High confidence (>0.9) → verify status='Approved'
    - [ ] Low confidence (<0.9) → verify status='Pending'
    - [ ] Threshold boundary tests
    - [ ] Auto-approve disabled → verify no approval
  - [ ] Test email notification types (pending vs auto-approved)
  - [ ] Test error handling scenarios (verify error records created)
  - [ ] Test foreign key relationships and cascade delete
  - [ ] Manual testing (spam, clean, edge cases)
  - [ ] Verify admin panel display and override capability
  - [ ] Test rejecting an auto-approved comment

- [ ] **Step 14**: Documentation and rollout
  - [ ] Update README with AI review feature docs
  - [ ] Create ai-review-runbook.md
  - [ ] Add inline code comments
  - [ ] Create deployment checklist (run migration, verify ai_comment_reviews table, check indexes)
  - [ ] Review documentation
  - [ ] Deploy to production
  - [ ] Verify first review appears in ai_comment_reviews table
  - [ ] Monitor initial comments

---

## Notes

- Implementation should follow prompts in plan.md sequentially
- Each step builds on previous steps
- Don't skip ahead or work out of order
- Mark steps complete only when fully tested
- Document any deviations from plan in this file

### Architecture Decision: Separate Table
- Using dedicated `ai_comment_reviews` table instead of adding columns to `comments`
- Benefits: Full review history, multiple providers, cleaner schema, easier analytics
- `comments.latest_ai_review_id` provides fast access to most recent review
- Foreign key with CASCADE delete ensures cleanup

## Blockers

(None currently)

## Questions

(Add any questions or clarifications needed here)
