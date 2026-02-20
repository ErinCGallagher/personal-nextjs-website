/**
 * Email notification service using Resend.
 * Sends notifications when comments are pending approval.
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
      from: fromEmail,
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
