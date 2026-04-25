/**
 * Email notification service using Resend.
 * Sends notifications in a specified format when comments are pending approval.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NewCommentNotificationParams {
  postSlug: string;
  commentBody: string;
  userName: string;
  userEmail: string;
}

/**
 * Sends an email notification when a new comment is pending approval
 */
export async function sendNewCommentNotification({
  postSlug,
  commentBody,
  userName,
  userEmail,
}: NewCommentNotificationParams): Promise<void> {
  const toEmail = process.env.NOTIFICATION_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!toEmail) {
    console.warn(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: `Erin Gallagher <${fromEmail}>`,
      to: toEmail,
      subject: `New comment pending approval: ${postSlug}`,
      html: `
        <h2>New Comment Pending Approval</h2>
        <p><strong>Post:</strong> ${postSlug}</p>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p><strong>Comment:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 10px 0;">
          ${commentBody.replace(/\n/g, "<br>")}
        </blockquote>
        <p><a href="${process.env.ADMIN_URL || "http://localhost:3000"}/admin/comments">View in Admin Panel</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

interface PendingCommentNotificationParams {
  comment: {
    id: string;
    post_slug: string;
    body: string;
    user_name: string;
  };
  aiReview: {
    confidence_score: number | null;
    flags: string[] | null;
    reasoning: string | null;
  } | null;
  notificationEmail: string;
  userEmail: string;
}

/**
 * Sends an email notification for a comment pending manual review.
 * This is called when AI review completes but confidence is below threshold,
 * or when AI review is disabled, or when AI review fails.
 */
export async function sendPendingCommentNotification({
  comment,
  aiReview,
  notificationEmail,
  userEmail,
}: PendingCommentNotificationParams): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!notificationEmail) {
    console.warn(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  try {
    // Build AI review section if available
    let aiSection = "";
    if (aiReview && aiReview.confidence_score !== null) {
      const confidencePercent = (aiReview.confidence_score * 100).toFixed(0);
      let confidenceColor = "#dc2626"; // red
      if (aiReview.confidence_score > 0.8) confidenceColor = "#16a34a"; // green
      else if (aiReview.confidence_score >= 0.5) confidenceColor = "#eab308"; // yellow

      aiSection = `
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <h3 style="color: #374151;">AI Review Assessment</h3>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">
          AI assessment provided for reference only. Final moderation decision is at admin discretion.
        </p>
        <p><strong>Confidence Score:</strong> <span style="color: ${confidenceColor}; font-weight: bold;">${confidencePercent}%</span></p>
        ${aiReview.flags && aiReview.flags.length > 0 ? `<p><strong>Flags:</strong> ${aiReview.flags.join(", ")}</p>` : ""}
        ${aiReview.reasoning ? `<p><strong>Reasoning:</strong> ${aiReview.reasoning}</p>` : ""}
      `;
    }

    await resend.emails.send({
      from: `Erin Gallagher <${fromEmail}>`,
      to: notificationEmail,
      subject: "New Comment Pending Review",
      html: `
        <h2>New Comment Pending Review</h2>
        <p><strong>Post:</strong> ${comment.post_slug}</p>
        <p><strong>From:</strong> ${comment.user_name} (${userEmail})</p>
        <p><strong>Comment:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 10px 0;">
          ${comment.body.replace(/\n/g, "<br>")}
        </blockquote>
        ${aiSection}
        <p style="margin-top: 20px;"><a href="${process.env.ADMIN_URL || "http://localhost:3000"}/admin/comments">View in Admin Panel</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send pending comment notification email:", error);
    throw error;
  }
}

interface AutoApprovedCommentNotificationParams {
  comment: {
    id: string;
    post_slug: string;
    body: string;
    user_name: string;
  };
  aiReview: {
    confidence_score: number;
    flags: string[] | null;
    reasoning: string | null;
  };
  notificationEmail: string;
  userEmail: string;
}

/**
 * Sends an email notification for a comment that was automatically approved by AI.
 * This is called when AI review completes with high confidence (above threshold).
 */
export async function sendAutoApprovedCommentNotification({
  comment,
  aiReview,
  notificationEmail,
  userEmail,
}: AutoApprovedCommentNotificationParams): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!notificationEmail) {
    console.warn(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  try {
    const confidencePercent = (aiReview.confidence_score * 100).toFixed(0);

    await resend.emails.send({
      from: `Erin Gallagher <${fromEmail}>`,
      to: notificationEmail,
      subject: "Comment Auto-Approved by AI",
      html: `
        <h2 style="color: #16a34a;">Comment Auto-Approved by AI</h2>
        <p style="color: #059669; font-weight: 500;">
          This comment was automatically approved based on high AI confidence score (&gt;90%).
        </p>
        <p><strong>Post:</strong> ${comment.post_slug}</p>
        <p><strong>From:</strong> ${comment.user_name} (${userEmail})</p>
        <p><strong>Comment:</strong></p>
        <blockquote style="border-left: 3px solid #10b981; padding-left: 15px; margin: 10px 0;">
          ${comment.body.replace(/\n/g, "<br>")}
        </blockquote>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <h3 style="color: #374151;">AI Review Assessment</h3>
        <p><strong>Confidence Score:</strong> <span style="color: #16a34a; font-weight: bold;">${confidencePercent}%</span></p>
        ${aiReview.flags && aiReview.flags.length > 0 ? `<p><strong>Flags:</strong> ${aiReview.flags.join(", ")}</p>` : ""}
        ${aiReview.reasoning ? `<p><strong>Reasoning:</strong> ${aiReview.reasoning}</p>` : ""}
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          You can still review or reject this comment if needed.
        </p>
        <p><a href="${process.env.ADMIN_URL || "http://localhost:3000"}/admin/comments">View in Admin Panel</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send auto-approved comment notification email:", error);
    throw error;
  }
}
