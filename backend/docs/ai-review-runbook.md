# AI Comment Review System - Operations Runbook

This runbook provides troubleshooting guidance and operational procedures for the AI-powered comment review system.

## Table of Contents

1. [System Overview](#system-overview)
2. [Troubleshooting](#troubleshooting)
3. [Emergency Procedures](#emergency-procedures)
4. [Monitoring](#monitoring)
5. [Configuration Changes](#configuration-changes)
6. [Future Enhancements](#future-enhancements)

## System Overview

### Architecture

```
Comment Submission
    ↓
Save to Database (status='Pending')
    ↓
Return Response to User (fast)
    ↓
[Async] AI Review Process:
    ├─ Call Gemini API
    ├─ Save Review Result
    ├─ Auto-Approve if Confidence ≥ Threshold
    └─ Send Email Notification
```

### Key Components

- **AI Review Service** (`src/services/ai-review.ts`): Core review logic
- **Gemini Client** (`src/services/gemini-client.ts`): API integration
- **Database Functions** (`src/db/ai-reviews.ts`): Persistence layer
- **Email Service** (`src/email.ts`): Notifications
- **Configuration** (`src/config.ts`): Feature flags and settings

### Database Tables

- **`ai_comment_reviews`**: Stores all review history
  - Linked to comments via `latest_ai_review_id`
  - Supports multiple reviews per comment
  - Tracks performance metrics (response time)

## Troubleshooting

### Issue: AI Review Not Running

**Symptoms**: Comments created but `latest_ai_review_id` remains null

**Possible Causes**:

1. **AI review disabled**
   ```bash
   # Check configuration
   echo $AI_REVIEW_ENABLED
   ```
   **Solution**: Set `AI_REVIEW_ENABLED=true` in `.env`

2. **Invalid API key**
   ```bash
   # Check logs for API errors
   grep "API key not valid" logs/app.log
   ```
   **Solution**: Verify `GEMINI_API_KEY` in Google AI Studio

3. **Server crash during review**
   ```sql
   -- Check for error records
   SELECT * FROM ai_comment_reviews
   WHERE status='error'
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   **Solution**: Check `error_message` field and server logs

### Issue: All Comments Auto-Approved (Including Spam)

**Symptoms**: Spam comments have status='Approved' and `status_updated_by='AI-AutoApprove'`

**Possible Causes**:

1. **Threshold too low**
   ```bash
   echo $AI_AUTO_APPROVE_THRESHOLD
   ```
   **Solution**: Increase threshold to 0.9 or higher

2. **AI prompt not detecting spam**
   ```sql
   -- Check recent auto-approved reviews
   SELECT c.body, ar.confidence_score, ar.flags, ar.reasoning
   FROM comments c
   JOIN ai_comment_reviews ar ON c.latest_ai_review_id = ar.id
   WHERE c.status_updated_by = 'AI-AutoApprove'
   ORDER BY c.created_at DESC
   LIMIT 10;
   ```
   **Solution**: Review AI reasoning and consider adjusting prompt or threshold

### Issue: No Comments Being Auto-Approved

**Symptoms**: All comments stay pending even with legitimate content

**Possible Causes**:

1. **Auto-approval disabled**
   ```bash
   echo $AI_AUTO_APPROVE_ENABLED
   ```
   **Solution**: Set `AI_AUTO_APPROVE_ENABLED=true`

2. **Threshold set to 1.0**
   ```bash
   echo $AI_AUTO_APPROVE_THRESHOLD
   ```
   **Solution**: Lower threshold to 0.9 (recommended)

3. **AI consistently giving low confidence**
   ```sql
   -- Check confidence score distribution
   SELECT
     FLOOR(confidence_score * 10) / 10 as score_range,
     COUNT(*) as count
   FROM ai_comment_reviews
   WHERE status='completed'
   GROUP BY score_range
   ORDER BY score_range;
   ```
   **Solution**: Review AI reasoning patterns and consider prompt adjustment

### Issue: Slow Review Times

**Symptoms**: Reviews taking > 5 seconds

**Check Performance**:
```sql
SELECT
  AVG(api_response_time_ms) as avg_ms,
  MAX(api_response_time_ms) as max_ms,
  COUNT(*) as total_reviews
FROM ai_comment_reviews
WHERE status='completed'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**Solutions**:
- Gemini API typically responds in < 2 seconds
- Check network connectivity
- Verify API rate limits not being hit

### Issue: Email Notifications Not Sending

**Symptoms**: Reviews complete but no emails received

**Possible Causes**:

1. **Email not configured**
   ```bash
   echo $NOTIFICATION_EMAIL
   echo $RESEND_API_KEY
   ```

2. **Check email service logs**
   ```bash
   grep "Failed to send" logs/app.log
   ```

## Emergency Procedures

### Disable Auto-Approval Immediately

If spam is getting auto-approved:

```bash
# Update .env
AI_AUTO_APPROVE_ENABLED=false

# Restart server
pnpm start
```

Comments will still be reviewed by AI but require manual approval.

### Disable AI Review Entirely

If AI service is causing issues:

```bash
# Update .env
AI_REVIEW_ENABLED=false

# Restart server
pnpm start
```

All comments will go directly to pending status (manual review required).

### Bulk Reject Auto-Approved Spam

If spam was auto-approved:

```sql
-- Find suspicious auto-approved comments
SELECT id, body, created_at, c.status_updated_at
FROM comments c
JOIN ai_comment_reviews ar ON c.latest_ai_review_id = ar.id
WHERE c.status_updated_by = 'AI-AutoApprove'
  AND ar.confidence_score < 0.95
  AND c.created_at > NOW() - INTERVAL '7 days'
ORDER BY c.created_at DESC;

-- Manually review and reject as needed
UPDATE comments
SET status = 'Rejected',
    status_updated_at = NOW(),
    status_updated_by = 'admin-manual-review'
WHERE id = 'comment-uuid-here';
```

## Monitoring

### Daily Health Check

```sql
-- Reviews in last 24 hours
SELECT
  status,
  COUNT(*) as count,
  AVG(api_response_time_ms) as avg_response_ms
FROM ai_comment_reviews
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Auto-approval rate
SELECT
  COUNT(*) FILTER (WHERE status_updated_by = 'AI-AutoApprove') as auto_approved,
  COUNT(*) FILTER (WHERE status = 'Pending') as pending,
  COUNT(*) as total
FROM comments
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Weekly Analysis

```sql
-- Flag distribution
SELECT
  flag,
  COUNT(*) as occurrences
FROM ai_comment_reviews,
     jsonb_array_elements_text(flags) as flag
WHERE created_at > NOW() - INTERVAL '7 days'
  AND status = 'completed'
GROUP BY flag
ORDER BY occurrences DESC;

-- Error rate
SELECT
  COUNT(*) FILTER (WHERE status = 'error') * 100.0 / COUNT(*) as error_percentage
FROM ai_comment_reviews
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Alert Thresholds

Consider setting up alerts for:
- Error rate > 10% (API issues)
- Average response time > 5 seconds (performance)
- Zero reviews in 24 hours (service down)
- Auto-approval rate > 95% (threshold too low) or < 50% (threshold too high)

## Configuration Changes

### Adjusting the Threshold

Current recommendation: **0.9**

To change:

1. Update `.env`:
   ```
   AI_AUTO_APPROVE_THRESHOLD=0.85
   ```

2. Restart server

3. Monitor for 48 hours:
   ```sql
   SELECT
     DATE_TRUNC('day', created_at) as date,
     COUNT(*) FILTER (WHERE status_updated_by = 'AI-AutoApprove') as auto_approved,
     COUNT(*) as total
   FROM comments
   WHERE created_at > NOW() - INTERVAL '2 days'
   GROUP BY date;
   ```

4. Review any auto-approved comments manually

### Switching AI Providers (Future)

The system is designed to support multiple providers:

1. Implement new client in `src/services/[provider]-client.ts`
2. Update `src/services/ai-review.ts` to use new provider
3. Set `AI_REVIEW_PROVIDER=[provider]` in `.env`
4. Existing reviews remain unchanged (provider field stores source)

## Future Enhancements

### Potential Improvements

1. **A/B Testing**: Test different prompts or models
2. **Consensus Scoring**: Use multiple AI providers and average scores
3. **Learning Mode**: Track admin overrides to fine-tune threshold
4. **Dashboard**: Real-time monitoring UI in admin panel
5. **Webhooks**: Notify external systems of low-confidence comments
6. **Fine-tuning**: Train custom model on your specific comment patterns

### Review History Analysis

The system stores full history, enabling:

```sql
-- Compare reviews for same comment (if re-reviewed)
SELECT
  comment_id,
  COUNT(*) as review_count,
  ARRAY_AGG(confidence_score ORDER BY created_at) as confidence_scores,
  ARRAY_AGG(created_at ORDER BY created_at) as review_times
FROM ai_comment_reviews
GROUP BY comment_id
HAVING COUNT(*) > 1;
```

## Support

For issues not covered in this runbook:
1. Check server logs for detailed error messages
2. Review AI response in `ai_comment_reviews.reasoning` field
3. Test with a known-good comment to isolate issues
4. Check [Gemini API status](https://status.cloud.google.com/)

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- Main README: [../README.md](../README.md)
