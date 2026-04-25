# Backend

Express API server for egallagher.com.

## Prerequisites

PostgreSQL 17 is managed via [mise](https://mise.jdx.dev). Run once from the project root:

```bash
mise install
initdb --locale=en_US.UTF-8 -E UTF-8
createdb blog_dev
createdb blog_test
pnpm migrate
```

Start and stop the database:

```bash
pg_ctl start -l .postgres/postgres.log
pg_ctl stop
```

## Development

```bash
pnpm dev
```

Server runs on [http://localhost:3001](http://localhost:3001) by default.

## Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

The [Vitest VS Code extension](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) is recommended for running and debugging individual tests from the editor.


### AI-Powered Comment Review & Auto-Approval

The backend includes an optional AI-powered comment review system that automatically analyzes new comments for spam, toxicity, and relevance. Comments with high confidence scores can be automatically approved, reducing manual moderation workload.

#### Features

- **Automatic Review**: Every new comment is analyzed by AI (Google Gemini) for quality and safety
- **Auto-Approval**: Comments with confidence scores above the threshold are automatically approved
- **Admin Advisory**: AI assessments are displayed in the admin panel to help with manual decisions
- **Email Notifications**: Different emails for auto-approved vs pending comments
- **Full History**: All AI reviews are stored for audit and analysis

#### Setup

1. **Get an API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey)

2. **Configure Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key (required if AI review is enabled)
   - `AI_REVIEW_ENABLED`: Set to `true` to enable AI review (default: `false`)
   - `AI_REVIEW_PROVIDER`: AI provider to use (default: `gemini`)
   - `AI_AUTO_APPROVE_ENABLED`: Set to `true` to enable auto-approval (default: `true`)
   - `AI_AUTO_APPROVE_THRESHOLD`: Confidence threshold for auto-approval (default: `0.9`)

3. **Run Migration**: The `ai_comment_reviews` table is created by migration `005_create_ai_comment_reviews.sql`

#### How It Works

1. When a comment is submitted, it's saved with status "Pending"
2. An AI review is triggered asynchronously (doesn't block the response)
3. The AI analyzes the comment and returns:
   - **Confidence Score** (0.0-1.0): How safe/appropriate the comment is
   - **Flags**: Issues detected (e.g., "spam", "toxic", "off-topic")
   - **Reasoning**: Brief explanation of the assessment
4. If confidence ≥ threshold and auto-approve is enabled, the comment is approved
5. An email notification is sent (different for auto-approved vs pending)
6. The admin can view AI assessments and override any decision

#### Confidence Score Interpretation

- **> 0.8 (Green)**: Likely safe - AI recommends approval
- **0.5-0.8 (Yellow)**: Review carefully - uncertain
- **< 0.5 (Red)**: Likely problematic - AI recommends rejection

#### Configuration Recommendations

- **Threshold 0.9+**: Recommended for production to minimize false positives
- **Threshold < 0.9**: May auto-approve some questionable comments
- **Threshold 1.0**: No comments will be auto-approved (AI review still provides guidance)

**⚠️ Warning**: Setting the threshold too low may result in spam or inappropriate comments being auto-approved. Start with 0.9 or higher and adjust based on your needs.

#### Disabling Features

To disable auto-approval but keep AI review for admin guidance:
```
AI_REVIEW_ENABLED=true
AI_AUTO_APPROVE_ENABLED=false
```

To disable AI review entirely:
```
AI_REVIEW_ENABLED=false
```

## Endpoints

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check and database connection test |

### Post Interactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts/:slug/likes?anonymous_id=` | Like count, comment count, and liked state for a post |
| POST | `/api/posts/:slug/like` | Toggle a like on a post |
| GET | `/api/posts/:slug/comments` | Get all approved comments for a post |
| POST | `/api/posts/:slug/comment` | Create a comment on a post (sends email notification) |

### Auth (BetterAuth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-in/email` | Authenticate with email and password |
| POST | `/api/auth/sign-out` | End the current session |
| GET | `/api/auth/get-session` | Get the current session |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/comments?status=Pending` | List comments filtered by status (Pending/Approved/Rejected) |
| PATCH | `/api/admin/comments/:id` | Update comment status |

### Examples

```bash
# Get like count and comment count
curl http://localhost:3001/api/posts/cape-town-itinerary/likes?anonymous_id=550e8400-e29b-41d4-a716-446655440001

# Toggle a like
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/like \
  -H "Content-Type: application/json" \
  -d '{"anonymous_id": "550e8400-e29b-41d4-a716-446655440001"}'

# Get approved comments
curl http://localhost:3001/api/posts/cape-town-itinerary/comments

# Create a comment
curl -X POST http://localhost:3001/api/posts/cape-town-itinerary/comment \
  -H "Content-Type: application/json" \
  -d '{"anonymous_id": "550e8400-e29b-41d4-a716-446655440001", "name": "Jane Doe", "email": "jane@example.com", "body": "Great post!"}'

# Sign in
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "your-password"}' \
  -c cookies.txt

# List pending comments
curl http://localhost:3001/api/admin/comments?status=Pending \
  -b cookies.txt

# Approve a comment
curl -X PATCH http://localhost:3001/api/admin/comments/COMMENT-UUID \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}' \
  -b cookies.txt
```
