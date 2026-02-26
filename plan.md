# AI Comment Review Implementation Plan

## Project Overview

Implement automated AI-powered comment review system that analyzes pending comments and provides confidence scores to assist with moderation decisions. Given the low volume (4 comments/month), we'll use free-tier AI APIs.

## API Options Analysis

### Recommended: Google Gemini API
- **Free tier**: 15 requests/minute, 1500 requests/day, 1M requests/month
- **Cost**: Completely free for Gemini 1.5 Flash
- **Pros**: More than sufficient for 4 comments/month, fast inference, good content safety features
- **API**: Simple REST API via `@google/generative-ai` npm package

### Alternative: Anthropic Claude API
- **Free tier**: None (pay-as-you-go only)
- **Cost**: ~$0.003 per comment (Claude 3.5 Haiku)
- **Pros**: Excellent reasoning, constitutional AI safety
- **Monthly cost**: ~$0.012/month for 4 comments
- **Note**: Still very cheap, but requires payment method

**Decision**: Use Gemini API for free tier, with architecture allowing easy swap to Claude if needed.

## Architecture Blueprint

### 1. Database Schema Changes
Create new `ai_comment_reviews` table to store AI review history:
- `id`: UUID primary key
- `comment_id`: UUID foreign key to comments table
- `provider`: VARCHAR(50) - 'gemini', 'claude', etc.
- `confidence_score`: DECIMAL(3,2) (0.00-1.00)
- `flags`: JSONB (array of concern categories)
- `reasoning`: TEXT (explanation of score)
- `status`: VARCHAR(20) - 'completed', 'error', 'pending'
- `error_message`: TEXT (if status='error')
- `reviewed_at`: TIMESTAMP
- `api_response_time_ms`: INTEGER (for monitoring)
- `created_at`: TIMESTAMP

Add to comments table:
- `latest_ai_review_id`: UUID foreign key to ai_comment_reviews table

Benefits: Maintains full history of reviews, supports multiple AI providers, cleaner schema separation, easier analytics

### 2. AI Review Service
New backend service module that:
- Accepts comment text + metadata
- Calls Gemini API with structured prompt
- Parses JSON response with confidence score + reasoning
- Returns structured review data

### 3. Review Criteria
AI evaluates comments for:
- **Spam detection** (promotional content, links, generic text)
- **Toxicity** (harassment, hate speech, personal attacks)
- **Relevance** (on-topic for blog post)
- **Coherence** (readable, makes sense)
- **Safety** (no dangerous/illegal content)

Returns:
- Overall confidence score (0-1, where 1 = definitely safe/good)
- Flags array (list of concerns found)
- Reasoning (brief explanation)

### 4. Integration Points
- **On comment submission**: Trigger AI review asynchronously after saving
- **Auto-approval**: Automatically approve comments with confidence score ≥ 0.9 (configurable)
- **Admin panel**: Display AI scores, flags, and reasoning alongside comments (admin can override)
- **Email notifications**: Different emails for pending review vs auto-approved comments

### 5. Error Handling & Fallbacks
- AI review failures don't block comment submission
- Retry logic with exponential backoff
- Manual review always available
- Logging for monitoring API usage

---

## Step-by-Step Implementation Plan

### Phase 1: Foundation (Steps 1-3)

#### Step 1: Add Database Schema for AI Reviews
**Goal**: Create separate table for AI review data with history tracking

**Tasks**:
1. Create migration file `005_create_ai_comment_reviews.sql`
2. Create `ai_comment_reviews` table with columns:
   - `id`, `comment_id`, `provider`, `confidence_score`, `flags`, `reasoning`
   - `status`, `error_message`, `reviewed_at`, `api_response_time_ms`, `created_at`
3. Add indexes on `comment_id` and `status`
4. Add `latest_ai_review_id` column to `comments` table (nullable, references ai_comment_reviews.id)
5. Add CASCADE delete so reviews are deleted when comment is deleted
6. Run migration on local database
7. Update TypeScript types in `models.ts` to add `AICommentReview` interface and update `Comment` type

**Verification**: Query both table schemas, verify foreign key relationships, test cascade deletion

---

#### Step 2: Set Up Gemini API Integration
**Goal**: Configure Gemini API access and create basic client wrapper

**Tasks**:
1. Install `@google/generative-ai` npm package in backend
2. Add `GEMINI_API_KEY` to backend `.env` (obtain from Google AI Studio)
3. Create `backend/src/services/gemini-client.ts`:
   - Initialize Gemini client
   - Export configured model instance (gemini-1.5-flash)
   - Add error handling wrapper
4. Create simple health check function to verify API connectivity
5. Add unit test to verify client initialization (mock API in test)

**Verification**: Run health check, confirm API responds without errors

---

#### Step 3: Design AI Review Prompt & Response Schema
**Goal**: Create structured prompt template and Zod schema for AI responses

**Tasks**:
1. Create `backend/src/services/ai-review-prompt.ts`:
   - Define system prompt with review criteria
   - Create function to build prompt from comment data
   - Include examples of good/bad comments
2. Create `backend/src/schemas.ts` additions:
   - `AIReviewResponse` schema with Zod validation
   - Fields: `confidenceScore` (number 0-1), `flags` (string array), `reasoning` (string)
3. Document expected flag values: 'spam', 'toxic', 'off-topic', 'incoherent', 'unsafe'
4. Add JSDoc comments explaining scoring guidelines

**Verification**: Review prompt with team, validate schema parses sample JSON responses

---

### Phase 2: Core AI Review Service (Steps 4-6)

#### Step 4: Implement AI Review Service
**Goal**: Create service that sends comments to Gemini and parses responses

**Tasks**:
1. Create `backend/src/services/ai-review.ts`:
   - `reviewComment(commentText: string, postSlug: string)` function
   - Call Gemini API with prompt
   - Request JSON response format
   - Parse response with Zod schema
   - Return typed `AIReviewResponse` object
2. Add error handling:
   - API timeout (10s limit)
   - Invalid JSON responses
   - Schema validation failures
   - Rate limiting (catch and throw specific error)
3. Add request logging (comment ID, timestamp, success/failure)
4. Export service function

**Verification**: Write unit tests with mocked Gemini responses (spam case, clean case, error case)

---

#### Step 5: Add Database Functions for AI Review Data
**Goal**: Create DB helpers to save and retrieve AI review results from separate table

**Tasks**:
1. Update `backend/src/db.ts`:
   - `saveAIReview(commentId: string, review: AIReviewResponse, provider: string, responseTimeMs: number)` function
   - INSERT new row into `ai_comment_reviews` table
   - UPDATE `comments.latest_ai_review_id` to point to new review
   - Return the review ID
2. `markAIReviewError(commentId: string, errorMessage: string, provider: string)` function:
   - INSERT row with `status='error'`, `error_message` populated
   - UPDATE `comments.latest_ai_review_id`
3. `approveComment(commentId: string, approvedBy: string)` function:
   - UPDATE comments SET status='Approved', status_updated_at=NOW(), status_updated_by=approvedBy
   - Used for auto-approval when AI confidence is high
4. Update `getCommentById()` to LEFT JOIN `ai_comment_reviews` and include latest review data
5. Update `getCommentsBySlug()` admin version to JOIN and include AI review data
6. `getAIReviewHistory(commentId: string)` function to fetch all reviews for a comment (for future use)

**Verification**: Write integration test that saves review data, retrieves it via comment queries, verifies foreign key relationships, and tests comment approval

---

#### Step 6: Integrate AI Review into Comment Submission Flow with Auto-Approval
**Goal**: Trigger AI review asynchronously when new comment is created, auto-approve if confidence > threshold, then send email notification

**Tasks**:
1. Update `backend/src/routes/posts.ts` POST `/api/posts/:slug/comment` handler:
   - After comment insert succeeds, trigger async AI review
   - Use `Promise.resolve().then()` pattern (don't await, fire-and-forget)
   - Pass comment ID, body, post slug, and notification details to review service
   - Do NOT send email here - it will be sent after AI review completes
2. Create review orchestration function in `ai-review.ts`:
   - `processCommentReview(commentId: string, commentText: string, postSlug: string, notificationEmail: string, userName: string, userEmail: string)`
   - Call `reviewComment()` service
   - Save results to DB or mark error
   - **Auto-approval logic:**
     - If review successful AND `config.AI_AUTO_APPROVE_ENABLED` is true
     - Check if `confidenceScore >= config.AI_AUTO_APPROVE_THRESHOLD` (default 0.9)
     - If yes, call `approveComment(commentId, 'AI-AutoApprove')`
     - Log auto-approval with confidence score
   - After review completes, fetch full comment with AI data
   - Send appropriate email notification:
     - If auto-approved: call `sendAutoApprovedCommentNotification()`
     - If still pending: call `sendPendingCommentNotification()`
   - Wrap entire process in try-catch
   - Log success/failure
3. Ensure comment submission response isn't delayed by AI review

**Verification**: Submit test comment with clean content, verify AI review completes, check comment status='Approved' if confidence >0.9, verify admin receives auto-approval email

---

### Phase 3: Admin Panel Integration (Steps 7-9)

#### Step 7: Update Admin API to Return AI Review Data
**Goal**: Include AI scores and flags in admin comment list API via JOIN

**Tasks**:
1. Update `backend/src/routes/admin.ts` GET `/api/admin/comments`:
   - Modify SQL query to LEFT JOIN `ai_comment_reviews` via `latest_ai_review_id`
   - SELECT review fields: `provider`, `confidence_score`, `flags`, `reasoning`, `status`, `reviewed_at`
   - Nest AI data in response or flatten with aliases (e.g., `ai_confidence_score`)
   - Ensure backward compatibility (existing frontend won't break, AI data can be null)
2. Test API response with Postman/curl
3. Verify JSON structure matches expected frontend types

**Verification**: Call admin API, confirm AI fields present in response JSON when reviews exist, null when they don't

---

#### Step 8: Update Frontend Types and API Client
**Goal**: Add TypeScript types for AI review data in frontend

**Tasks**:
1. Update `frontend/app/types/comment.ts` (or create if doesn't exist):
   - Add `AIReviewData` interface
   - Extend `Comment` type to include optional `aiReview` field
2. Update `frontend/app/lib/api.ts`:
   - Ensure `fetchComments()` includes AI fields in response type
   - No logic changes needed (backend already returns data)

**Verification**: TypeScript compilation succeeds, no type errors

---

#### Step 9: Display AI Review Data in Admin Panel
**Goal**: Show confidence scores and flags in admin comment moderation UI (AI is advisory only - admin has final say)

**Tasks**:
1. Update `frontend/app/admin/comments/page.tsx`:
   - Add AI Review section to each comment card (displayed above or alongside approve/reject buttons)
   - Display confidence score as percentage with colour coding:
     - Green (>80%): "Likely safe - AI recommends approval"
     - Yellow (50-80%): "Review carefully - uncertain"
     - Red (<50%): "Likely problematic - AI recommends rejection"
   - Show flags as badges (if any present)
   - Display reasoning text in expandable/collapsible section
   - Show review status indicator (completed/pending/error)
   - Add note: "AI assessment is advisory only. You have final decision."
2. Add visual indicators:
   - Icon for AI-reviewed vs no review
   - Tooltip explaining confidence score interpretation
3. Keep existing approve/reject buttons unchanged - admin can always override AI recommendation
4. Style with Tailwind classes to match existing admin panel design

**Verification**: Load admin panel, verify AI data displays correctly, test approving a low-confidence comment and rejecting a high-confidence comment

---

### Phase 4: Enhanced Notifications (Step 10)

#### Step 10: Include AI Review in Email Notifications (Pending and Auto-Approved)
**Goal**: Send appropriate email notification after AI review completes - different emails for pending vs auto-approved comments

**Tasks**:
1. Create two email notification functions in `backend/src/email.ts`:

   **A. `sendPendingCommentNotification(comment, aiReview)`:**
   - For comments that need manual review (confidence <= threshold)
   - Subject: "New Comment Pending Review"
   - Include AI Review section with:
     - Confidence score as percentage with colour coding
     - Display flags as list if any present
     - Brief reasoning
     - Disclaimer: "AI assessment provided for reference only. Final moderation decision is at admin discretion."
   - Include link to admin panel for approval
   - Make AI section conditional - only show if aiReview is provided

   **B. `sendAutoApprovedCommentNotification(comment, aiReview)`:**
   - For comments auto-approved by AI (confidence > threshold)
   - Subject: "Comment Auto-Approved by AI"
   - Include message: "This comment was automatically approved based on high AI confidence score."
   - Include AI Review section showing why it was approved
   - Show confidence score (will be >90%)
   - Include link to admin panel if admin wants to review/reject it
   - Note: "You can still reject this comment manually if needed."

2. Update `processCommentReview()` in `ai-review.ts` (from Step 6):
   - After AI review and potential auto-approval, fetch full comment with AI data
   - Check comment status:
     - If status='Approved', call `sendAutoApprovedCommentNotification()`
     - If status='Pending', call `sendPendingCommentNotification()`
   - If AI review failed, send pending notification with aiReview=null

3. Test both email templates locally (use Resend test mode)

**Verification**: Submit high-confidence comment (>0.9), verify auto-approval email sent. Submit low-confidence comment, verify pending review email sent.

---

### Phase 5: Monitoring & Polish (Steps 11-12)

#### Step 11: Add Logging and Monitoring
**Goal**: Track AI review performance and catch issues

**Tasks**:
1. Create `backend/src/utils/logger.ts` (if doesn't exist):
   - Structured logging for AI review events
   - Log: comment ID, review duration, confidence score, flags, errors
2. Add logging in `ai-review.ts`:
   - Start/end of each review
   - API response time
   - Success/failure status
   - Token usage (if available from Gemini API)
3. Create simple dashboard queries against `ai_comment_reviews` table:
   - Count reviews by status
   - Average confidence score
   - Most common flags (unnest JSONB array)
   - Error rate by provider
   - Review history per comment
4. Add these queries to admin panel stats section (optional)

**Verification**: Submit test comments, check logs contain expected data

---

#### Step 12: Add Configuration and Feature Flags
**Goal**: Make AI review and auto-approval optional and configurable

**Tasks**:
1. Add environment variables to backend `.env`:
   - `AI_REVIEW_ENABLED=true` (feature flag to enable/disable AI review)
   - `AI_REVIEW_PROVIDER=gemini` (allow future Claude integration)
   - `AI_AUTO_APPROVE_ENABLED=true` (enable/disable auto-approval feature)
   - `AI_AUTO_APPROVE_THRESHOLD=0.9` (confidence threshold for auto-approval, 0.0-1.0)
2. Update comment submission flow to check `AI_REVIEW_ENABLED`
3. Create `backend/src/config.ts`:
   - Export typed config object with all AI settings
   - Validate env vars on startup:
     - Fail fast if GEMINI_API_KEY missing when AI_REVIEW_ENABLED=true
     - Validate AI_AUTO_APPROVE_THRESHOLD is between 0 and 1
     - If AI_AUTO_APPROVE_ENABLED=true but AI_REVIEW_ENABLED=false, throw error (can't auto-approve without AI)
   - Use Zod for validation
4. Update `processCommentReview()` to check config before auto-approving
5. Document configuration options in README:
   - Explain threshold values (recommend 0.9 or higher)
   - Warning about setting threshold too low
   - How to disable auto-approval but keep AI review

**Verification**:
- Toggle AI_REVIEW_ENABLED, verify AI review skipped when disabled
- Set AI_AUTO_APPROVE_THRESHOLD=1.0, verify no comments auto-approved
- Set AI_AUTO_APPROVE_ENABLED=false, verify comments stay pending even with high confidence

---

### Phase 6: Testing & Documentation (Steps 13-14)

#### Step 13: Comprehensive Testing
**Goal**: Ensure AI review system and auto-approval work reliably

**Tasks**:
1. Write integration tests in `backend/test/`:
   - End-to-end comment submission with AI review
   - Mock Gemini API responses (high confidence, low confidence, errors)
   - **Auto-approval tests:**
     - Mock high confidence (0.95) → verify comment status='Approved'
     - Mock low confidence (0.60) → verify comment status='Pending'
     - Test threshold boundary (exactly 0.9)
     - Test with AI_AUTO_APPROVE_ENABLED=false → verify no auto-approval
   - Test error handling (API failure, timeout, invalid JSON)
   - Test database persistence of review data
   - Verify correct email sent (auto-approval vs pending)
2. Manual testing scenarios:
   - Submit obvious spam comment (check for low score, stays pending)
   - Submit clean, genuine comment (check for high score, auto-approved)
   - Submit edge case (profanity, links, long text)
   - Verify admin panel displays correctly for both pending and approved comments
   - Check email notifications:
     - Auto-approval email for high-confidence comments
     - Pending review email for low-confidence comments
   - Test admin override: reject an auto-approved comment
3. Load testing (optional):
   - Simulate 10 concurrent comments
   - Verify no race conditions in auto-approval

**Verification**: All tests pass, manual testing confirms auto-approval works correctly, email notifications sent appropriately

---

#### Step 14: Documentation and Rollout
**Goal**: Document system and prepare for production

**Tasks**:
1. Update project README with:
   - AI review feature description
   - Setup instructions (API key, env vars)
   - Configuration options
   - How to interpret confidence scores
2. Create runbook document:
   - What to do if AI review fails
   - How to disable feature if needed
   - Monitoring queries to check health
3. Add comments to code explaining key decisions
4. Create PR with all changes:
   - Clear commit messages for each step
   - Link to this plan in PR description
5. Deploy to production:
   - Run migrations
   - Set env vars
   - Monitor first few real comments

**Verification**: Documentation reviewed, successful production deployment

---

## Implementation Prompts for LLM

Each prompt below builds on previous work. They should be executed sequentially.

### Prompt 1: Database Migration

```
Create a database migration to add a separate AI reviews table with full history tracking.

Location: backend/migrations/005_create_ai_comment_reviews.sql

Create a new table called ai_comment_reviews:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- comment_id: UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE
- provider: VARCHAR(50) NOT NULL (e.g., 'gemini', 'claude')
- confidence_score: DECIMAL(3,2) (0.00 to 1.00, can be NULL if error)
- flags: JSONB (array of concern categories, can be NULL)
- reasoning: TEXT (AI explanation, can be NULL if error)
- status: VARCHAR(20) NOT NULL DEFAULT 'completed' (values: 'completed', 'error', 'pending')
- error_message: TEXT (populated when status='error')
- reviewed_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- api_response_time_ms: INTEGER (for monitoring performance)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

Create indexes:
- CREATE INDEX idx_ai_reviews_comment_id ON ai_comment_reviews(comment_id)
- CREATE INDEX idx_ai_reviews_status ON ai_comment_reviews(status)

Add to comments table:
- ALTER TABLE comments ADD COLUMN latest_ai_review_id UUID REFERENCES ai_comment_reviews(id)

Also update backend/src/models.ts:
- Add AICommentReview interface with all fields
- Update Comment interface to include optional latestAIReview field
```

### Prompt 2: Gemini API Client Setup

```
Set up the Google Gemini API integration in the backend.

Tasks:
1. Install @google/generative-ai package (add to backend/package.json)
2. Create backend/src/services/gemini-client.ts that:
   - Imports GoogleGenerativeAI from the package
   - Reads GEMINI_API_KEY from environment
   - Initializes the client
   - Exports a configured gemini-1.5-flash model instance
   - Includes error handling for missing API key
3. Add a simple healthCheck() function that verifies API connectivity
4. Add proper TypeScript types and JSDoc comments

The file should export both the model instance and the health check function.
```

### Prompt 3: AI Review Prompt Design

```
Create the AI review prompt template and response schema.

Create backend/src/services/ai-review-prompt.ts:
- Export buildReviewPrompt(commentText: string, postSlug: string): string
- Prompt should ask AI to analyze the comment for:
  * Spam (promotional content, generic text, suspicious links)
  * Toxicity (harassment, hate speech, personal attacks)
  * Relevance (on-topic for a technical blog)
  * Coherence (readable and makes sense)
  * Safety (no dangerous or illegal content)
- Request JSON response with: confidenceScore (0-1), flags (array), reasoning (string)
- Include 2-3 examples of good vs bad comments in prompt

Also add to backend/src/schemas.ts:
- AIReviewResponseSchema (Zod schema)
- Export AIReviewResponse type
- Validate confidenceScore is 0-1, flags is string array, reasoning is string
```

### Prompt 4: AI Review Service Implementation

```
Implement the core AI review service that calls Gemini and parses responses.

Create backend/src/services/ai-review.ts:
- Import gemini client and schemas
- Export async reviewComment(commentText: string, postSlug: string): Promise<AIReviewResponse>
- Function should:
  * Build prompt using buildReviewPrompt()
  * Call Gemini API with generateContent()
  * Request JSON response format
  * Parse response text as JSON
  * Validate with AIReviewResponseSchema
  * Return typed response object
- Error handling for:
  * API timeouts (10s limit)
  * Invalid JSON responses
  * Schema validation failures
  * Rate limiting errors
- Add structured logging for each review attempt

Include JSDoc comments and TypeScript types.
```

### Prompt 5: Database Functions for AI Reviews

```
Add database functions to save and retrieve AI review data from the separate table, and approve comments.

Update backend/src/db.ts with:
1. saveAIReview(commentId: string, review: AIReviewResponse, provider: string, responseTimeMs: number): Promise<string>
   - INSERT new row into ai_comment_reviews table with status='completed'
   - Include comment_id, provider, confidence_score, flags (as JSON), reasoning, api_response_time_ms
   - Get the new review ID from RETURNING clause
   - UPDATE comments table: SET latest_ai_review_id = new review ID WHERE id = commentId
   - Return the review ID
   - Use a transaction to ensure both operations succeed or fail together

2. markAIReviewError(commentId: string, errorMessage: string, provider: string): Promise<void>
   - INSERT row into ai_comment_reviews with status='error' and error_message populated
   - UPDATE comments.latest_ai_review_id to point to this error record
   - Use transaction

3. approveComment(commentId: string, approvedBy: string): Promise<void>
   - UPDATE comments SET status='Approved', status_updated_at=NOW(), status_updated_by=$approvedBy WHERE id=$commentId
   - Used for AI auto-approval (approvedBy will be 'AI-AutoApprove')
   - Also used by admin manual approval (approvedBy will be admin username/id)

4. getAIReviewHistory(commentId: string): Promise<AICommentReview[]>
   - SELECT all reviews for a comment ordered by created_at DESC
   - For future use tracking review history

5. Update existing getCommentById() to LEFT JOIN ai_comment_reviews using latest_ai_review_id
6. Update getCommentsBySlug() admin version to LEFT JOIN and include AI review data

Use parameterized queries to prevent SQL injection. Add proper error handling and transactions.
```

### Prompt 6: Integrate AI Review into Comment Submission with Auto-Approval

```
Wire up AI review to trigger when new comments are submitted, auto-approve if high confidence, then send email notification.

Update backend/src/routes/posts.ts POST /api/posts/:slug/comment handler:
1. After successful comment insert, trigger async AI review
2. Use fire-and-forget pattern: Promise.resolve().then(async () => {...})
3. Pass comment data AND email notification details to processCommentReview()
4. Do NOT send email directly in this handler - it will be sent after AI review
5. Don't await review - let it run in background
6. Ensure comment submission response isn't delayed

Create processCommentReview(commentId: string, commentText: string, postSlug: string, notificationEmail: string, userName: string, userEmail: string) in ai-review.ts:
- Import config to access AI_AUTO_APPROVE_ENABLED and AI_AUTO_APPROVE_THRESHOLD
- Call reviewComment() service
- On success:
  * Call saveAIReview()
  * Check if auto-approval should happen:
    - If config.AI_AUTO_APPROVE_ENABLED is true
    - AND confidenceScore >= config.AI_AUTO_APPROVE_THRESHOLD
    - Then call approveComment(commentId, 'AI-AutoApprove')
    - Log auto-approval with comment ID and confidence score
- On error: call markAIReviewError()
- After review completes (success or error):
  * Fetch full comment with AI review data using getCommentById()
  * Check comment status to determine which email to send:
    - If status='Approved': import and call sendAutoApprovedCommentNotification()
    - If status='Pending': import and call sendPendingCommentNotification()
  * If review failed, send pending notification with aiReview=null
- Wrap entire process in try-catch
- Log success or failure with comment ID

The comment submission should complete immediately, with AI review, auto-approval (if applicable), and email happening asynchronously after (typically 2-4 seconds total).
```

### Prompt 7: Update Admin API for AI Data

```
Update the admin API to return AI review data by joining with the ai_comment_reviews table.

Modify backend/src/routes/admin.ts GET /api/admin/comments:
1. Update SQL query to LEFT JOIN ai_comment_reviews using latest_ai_review_id:
   LEFT JOIN ai_comment_reviews ar ON c.latest_ai_review_id = ar.id
2. SELECT review fields: ar.provider, ar.confidence_score, ar.flags, ar.reasoning, ar.status, ar.reviewed_at
3. Include these fields in the JSON response (nested or flattened with aliases like ai_provider, ai_confidence_score)
4. Maintain backward compatibility - AI fields will be null when no review exists
5. Ensure getCommentsBySlug() in db.ts already performs this JOIN (from Step 5)

Test that the API returns AI fields in the JSON response. The fields may be null for older comments or if review hasn't completed yet.
```

### Prompt 8: Frontend Types for AI Reviews

```
Add TypeScript types for AI review data in the frontend.

Tasks:
1. Create frontend/app/types/comment.ts (if it doesn't exist)
2. Define AIReviewData interface with:
   - id: string (review ID)
   - provider: string ('gemini', 'claude', etc.)
   - status: 'completed' | 'error' | 'pending'
   - confidenceScore: number | null
   - flags: string[] | null
   - reasoning: string | null
   - errorMessage: string | null
   - reviewedAt: string | null
   - apiResponseTimeMs: number | null
3. Extend the Comment interface (or type) to include:
   - latestAIReview?: AIReviewData | null
4. Update frontend/app/lib/api.ts fetchComments() return type to include AI review field

Ensure TypeScript compilation succeeds with no errors. No runtime logic changes needed yet.
```

### Prompt 9: Display AI Reviews in Admin Panel

```
Update the admin panel UI to show AI review data for each comment. The AI assessment is advisory only - admins always have final decision authority.

Modify frontend/app/admin/comments/page.tsx:
1. Add AI Review section to each comment card (above or alongside approve/reject buttons):
   - Provider badge (e.g., "Gemini" with icon)
   - Confidence score as percentage with colour coding:
     * Green text (>80%): "Likely safe - AI recommends approval"
     * Yellow text (50-80%): "Review carefully - uncertain"
     * Red text (<50%): "Likely problematic - AI recommends rejection"
   - Flags as coloured badges if present (use Tailwind badge styles)
   - Reasoning text in expandable/collapsible section
   - Review status indicator (completed/pending/error)
   - Add small disclaimer text: "AI assessment is advisory only. You have final decision."
2. Add icons to visually distinguish AI-reviewed vs no review
3. Show "No AI Review" message if latestAIReview is null
4. Show "AI Review Pending..." if status is 'pending'
5. Show "AI Review Failed" with error_message if status is 'error'
6. Display api_response_time_ms in small text (e.g., "Response: 1.2s")
7. Keep existing approve/reject buttons unchanged - admin can always override AI recommendation

Style using Tailwind classes to match existing admin panel design. Make the AI section visually distinct but not overwhelming.
```

### Prompt 10: Enhanced Email Notifications (Pending and Auto-Approved)

```
Create two types of email notifications: one for pending comments and one for auto-approved comments.

Update backend/src/email.ts:

1. Create sendPendingCommentNotification(comment: Comment, aiReview: AICommentReview | null, notificationEmail: string):
   - Subject: "New Comment Pending Review"
   - For comments that need manual review (confidence <= threshold or auto-approve disabled)
   - Include comment body, author info, post slug
   - Include AI Review section if aiReview is not null:
     * Show confidence score as percentage with colour coding
     * List any flags found as bullet points
     * Include brief reasoning text
     * Add disclaimer: "AI assessment provided for reference only. Final moderation decision is at admin discretion."
   - Include link to admin panel for approval/rejection
   - Make AI section conditional - only show if aiReview provided

2. Create sendAutoApprovedCommentNotification(comment: Comment, aiReview: AICommentReview, notificationEmail: string):
   - Subject: "Comment Auto-Approved by AI"
   - For comments auto-approved based on high confidence
   - Include message: "This comment was automatically approved based on high AI confidence score (>90%)."
   - Include comment body, author info, post slug
   - Include AI Review section showing:
     * High confidence score with green colour
     * Reasoning for approval
     * Any flags (should be empty or minimal)
   - Include link to admin panel with note: "You can still review or reject this comment if needed."
   - Style differently to indicate it's already approved

NOTE: These functions are called from processCommentReview() in ai-review.ts (Prompt 6) after the review and potential auto-approval complete.

Test both email templates to ensure they look good and are clearly distinguished.
```

### Prompt 11: Logging and Monitoring

```
Add structured logging for AI review operations.

Tasks:
1. Create backend/src/utils/logger.ts (if doesn't exist) with Winston or similar
2. Add logging in backend/src/services/ai-review.ts:
   - Log start of each review (comment ID, timestamp)
   - Log API call duration
   - Log success with confidence score and flags
   - Log failures with error details
   - Log rate limiting or timeout events
3. Include structured fields: commentId, postSlug, duration, success, confidenceScore, flags, provider

Optional: Create SQL queries against ai_comment_reviews table to calculate:
- SELECT status, COUNT(*) FROM ai_comment_reviews GROUP BY status
- SELECT AVG(confidence_score) FROM ai_comment_reviews WHERE status='completed'
- SELECT provider, COUNT(*), AVG(api_response_time_ms) FROM ai_comment_reviews GROUP BY provider
- Most common flags: SELECT flag, COUNT(*) FROM ai_comment_reviews, jsonb_array_elements_text(flags) AS flag GROUP BY flag
- Error rate by provider

These queries can be added to admin panel later for monitoring dashboard.
```

### Prompt 12: Configuration and Feature Flags

```
Add configuration system for AI review and auto-approval features.

Tasks:
1. Create backend/src/config.ts:
   - Export config object with validated environment variables
   - Include:
     * AI_REVIEW_ENABLED (boolean, default: false)
     * AI_REVIEW_PROVIDER (string, default: 'gemini')
     * GEMINI_API_KEY (string, required if AI_REVIEW_ENABLED=true)
     * AI_AUTO_APPROVE_ENABLED (boolean, default: true)
     * AI_AUTO_APPROVE_THRESHOLD (number, default: 0.9, range: 0.0-1.0)
   - Validation rules:
     * Fail fast if GEMINI_API_KEY missing when AI_REVIEW_ENABLED=true
     * Validate AI_AUTO_APPROVE_THRESHOLD is between 0 and 1
     * If AI_AUTO_APPROVE_ENABLED=true but AI_REVIEW_ENABLED=false, throw error (can't auto-approve without AI review)
   - Use Zod for validation

2. Add new env vars to backend/.env:
   - AI_REVIEW_ENABLED=true
   - AI_REVIEW_PROVIDER=gemini
   - GEMINI_API_KEY=(to be set by user)
   - AI_AUTO_APPROVE_ENABLED=true
   - AI_AUTO_APPROVE_THRESHOLD=0.9

3. Update comment submission in backend/src/routes/posts.ts:
   - Check config.AI_REVIEW_ENABLED before triggering review
   - Skip AI review entirely if disabled (no record created in ai_comment_reviews)
   - Comment will simply have null latest_ai_review_id

4. Update processCommentReview() in ai-review.ts:
   - Import config
   - Check config.AI_AUTO_APPROVE_ENABLED before auto-approving
   - Use config.AI_AUTO_APPROVE_THRESHOLD for comparison

5. Update README.md with configuration documentation:
   - Explain each config option
   - Recommended threshold values (0.9 or higher)
   - Warning: Setting threshold too low may auto-approve spam
   - How to disable auto-approval but keep AI review (set AI_AUTO_APPROVE_ENABLED=false)
   - How to adjust threshold based on your needs
```

### Prompt 13: Integration Testing

```
Add integration tests for AI review system and auto-approval.

Create backend/test/ai-review.test.ts:
1. Test end-to-end comment submission with mocked Gemini API
2. Test cases:
   - Successful review with high confidence score (verify ai_comment_reviews row created)
   - Successful review with low confidence score and flags
   - **Auto-approval test cases:**
     * Mock confidence 0.95 → verify comment status='Approved' and status_updated_by='AI-AutoApprove'
     * Mock confidence 0.60 → verify comment status='Pending'
     * Mock confidence exactly 0.9 (threshold boundary) → verify approved
     * Mock confidence 0.89 (just below threshold) → verify pending
     * Test with AI_AUTO_APPROVE_ENABLED=false → verify no auto-approval even with high confidence
     * Test with AI_AUTO_APPROVE_THRESHOLD=1.0 → verify no comments auto-approved
   - **Email notification tests:**
     * Mock high confidence → verify sendAutoApprovedCommentNotification called
     * Mock low confidence → verify sendPendingCommentNotification called
   - API timeout handling (verify error record in ai_comment_reviews)
   - Invalid JSON response handling
   - Schema validation failure
   - Database save operations (INSERT into ai_comment_reviews, UPDATE comments.latest_ai_review_id)
   - Foreign key relationship (verify cascade delete)
   - Multiple reviews for same comment (history tracking)
3. Mock the Gemini API calls and email sending (don't hit real API or send real emails in tests)
4. Verify AI review rows correctly saved to ai_comment_reviews table
5. Verify comments.latest_ai_review_id points to correct review
6. Test that comment submission completes even if AI review fails

Use existing test framework (Jest, Mocha, or similar). Ensure tests can run in CI environment.
```

### Prompt 14: Documentation and Deployment Prep

```
Finalize documentation and prepare for deployment.

Tasks:
1. Update project README.md:
   - Add "AI-Powered Comment Review & Auto-Approval" section
   - Document required environment variables (GEMINI_API_KEY, AI_REVIEW_ENABLED, AI_AUTO_APPROVE_ENABLED, AI_AUTO_APPROVE_THRESHOLD)
   - Explain confidence score interpretation
   - Document auto-approval feature and how to configure threshold
   - Warning about setting threshold too low
   - Link to Google AI Studio for API key
   - Document configuration options

2. Create backend/docs/ai-review-runbook.md:
   - Troubleshooting guide for AI review failures
   - How to disable auto-approval if needed
   - How to disable entire feature in emergency
   - SQL queries for monitoring review performance and auto-approval rate
   - Instructions for switching AI providers in future

3. Add inline code comments explaining:
   - Why we use fire-and-forget pattern for reviews
   - Auto-approval threshold reasoning (why 0.9 is recommended)
   - Why email is sent after review completes

4. Create deployment checklist:
   - Run migration 005 (creates ai_comment_reviews table)
   - Verify foreign key constraints and indexes created
   - Set GEMINI_API_KEY in production env
   - Verify feature flag setting
   - Test with one real comment
   - Verify review appears in ai_comment_reviews table
   - Monitor logs for first 24 hours

No code changes needed - documentation only.
```

---

## Success Criteria

- ✅ AI review runs automatically on every new comment
- ✅ High-confidence comments (≥0.9) are auto-approved
- ✅ Admin receives appropriate email (pending review vs auto-approved)
- ✅ Admin panel shows confidence scores and flags
- ✅ Admin can override AI decisions (reject auto-approved, approve low-confidence)
- ✅ System handles API failures gracefully
- ✅ Configuration is flexible and documented (auto-approve can be disabled)
- ✅ Tests verify core functionality and auto-approval
- ✅ Total cost remains $0/month with Gemini free tier

## Future Enhancements (Out of Scope)
- A/B testing different AI prompts (easy with history tracking)
- Integration with Claude API as alternative provider (supported by schema)
- ML model fine-tuning on your specific comment patterns
- Admin dashboard with AI review statistics and trends over time
- Webhook notifications for low-confidence comments
- Review history view in admin panel showing all past reviews for a comment
- Consensus scoring when using multiple AI providers
- A/B comparison of Gemini vs Claude review quality
