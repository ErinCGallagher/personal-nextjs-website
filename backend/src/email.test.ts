/**
 * Unit tests for email notification functionality.
 * Tests email sending with mocked Resend API.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create a mock send function
const mockSend = vi.fn();

// Mock the Resend module
vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

// Import after mocking
const {
  sendNewCommentNotification,
  sendPendingCommentNotification,
  sendAutoApprovedCommentNotification,
} = await import("./email");

describe("sendNewCommentNotification", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sends email with correct parameters when properly configured", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";
    process.env.FROM_EMAIL = "noreply@test.com";
    process.env.ADMIN_URL = "http://localhost:3000";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "This is a test comment",
      userName: "John Doe",
      userEmail: "john@example.com",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      from: "Erin Gallagher <noreply@test.com>",
      to: "admin@test.com",
      subject: "New comment pending approval: test-post",
      html: expect.stringContaining("test-post"),
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("John Doe");
    expect(callArgs.html).toContain("john@example.com");
    expect(callArgs.html).toContain("This is a test comment");
  });

  it("uses default from email when FROM_EMAIL is not set", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";
    delete process.env.FROM_EMAIL;

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Erin Gallagher <onboarding@resend.dev>",
      }),
    );
  });

  it("does not send email when NOTIFICATION_EMAIL is not configured", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    delete process.env.NOTIFICATION_EMAIL;

    const consoleSpy = vi.spyOn(console, "warn");

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("does not send email when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    process.env.NOTIFICATION_EMAIL = "admin@test.com";

    const consoleSpy = vi.spyOn(console, "warn");

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "RESEND_API_KEY not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("handles Resend API errors gracefully", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";

    mockSend.mockRejectedValueOnce(new Error("API Error"));

    const consoleSpy = vi.spyOn(console, "error");

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to send email notification:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("properly escapes newlines in comment body", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Line 1\nLine 2\nLine 3",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("Line 1<br>Line 2<br>Line 3");
  });
});

describe("sendPendingCommentNotification", () => {
  const originalEnv = process.env;

  const baseComment = {
    id: "comment-1",
    post_slug: "test-post",
    body: "This is a test comment",
    user_name: "Jane Doe",
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sends email with AI review section when aiReview is provided", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.FROM_EMAIL = "noreply@test.com";
    process.env.ADMIN_URL = "http://localhost:3000";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendPendingCommentNotification({
      comment: baseComment,
      aiReview: { confidence_score: 0.65, flags: ["spam"], reasoning: "Looks spammy" },
      notificationEmail: "admin@test.com",
      userEmail: "jane@example.com",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const html = mockSend.mock.calls[0][0].html;
    expect(html).toContain("test-post");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("This is a test comment");
    expect(html).toContain("AI Review Assessment");
    expect(html).toContain("spam");
    expect(html).toContain("Looks spammy");
  });

  it("sends email without AI review section when aiReview is null", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendPendingCommentNotification({
      comment: baseComment,
      aiReview: null,
      notificationEmail: "admin@test.com",
      userEmail: "jane@example.com",
    });

    const html = mockSend.mock.calls[0][0].html;
    expect(html).not.toContain("AI Review Assessment");
  });

  it("does not send email when notificationEmail is empty", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    const consoleSpy = vi.spyOn(console, "warn");

    await sendPendingCommentNotification({
      comment: baseComment,
      aiReview: null,
      notificationEmail: "",
      userEmail: "jane@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("does not send email when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;

    const consoleSpy = vi.spyOn(console, "warn");

    await sendPendingCommentNotification({
      comment: baseComment,
      aiReview: null,
      notificationEmail: "admin@test.com",
      userEmail: "jane@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "RESEND_API_KEY not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("throws when Resend API errors", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    mockSend.mockRejectedValueOnce(new Error("API Error"));

    await expect(
      sendPendingCommentNotification({
        comment: baseComment,
        aiReview: null,
        notificationEmail: "admin@test.com",
        userEmail: "jane@example.com",
      }),
    ).rejects.toThrow("API Error");
  });

  it("colours confidence score by threshold", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    const cases = [
      { score: 0.9, expectedColor: "#16a34a" },  // green: > 0.8
      { score: 0.6, expectedColor: "#eab308" },  // yellow: >= 0.5
      { score: 0.3, expectedColor: "#dc2626" },  // red: < 0.5
    ];

    for (const { score, expectedColor } of cases) {
      mockSend.mockResolvedValueOnce({ id: "test-id" });

      await sendPendingCommentNotification({
        comment: baseComment,
        aiReview: { confidence_score: score, flags: null, reasoning: null },
        notificationEmail: "admin@test.com",
        userEmail: "jane@example.com",
      });

      const html = mockSend.mock.calls.at(-1)![0].html;
      expect(html).toContain(expectedColor);
    }
  });
});

describe("sendAutoApprovedCommentNotification", () => {
  const originalEnv = process.env;

  const baseComment = {
    id: "comment-2",
    post_slug: "test-post",
    body: "Great post!",
    user_name: "John Smith",
  };

  const baseAiReview = {
    confidence_score: 0.95,
    flags: null,
    reasoning: "Clearly legitimate",
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sends email with correct content", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.FROM_EMAIL = "noreply@test.com";
    process.env.ADMIN_URL = "http://localhost:3000";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendAutoApprovedCommentNotification({
      comment: baseComment,
      aiReview: baseAiReview,
      notificationEmail: "admin@test.com",
      userEmail: "john@example.com",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toBe("Comment Auto-Approved by AI");
    expect(call.html).toContain("test-post");
    expect(call.html).toContain("John Smith");
    expect(call.html).toContain("john@example.com");
    expect(call.html).toContain("Great post!");
    expect(call.html).toContain("95%");
    expect(call.html).toContain("Clearly legitimate");
  });

  it("does not send email when notificationEmail is empty", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    const consoleSpy = vi.spyOn(console, "warn");

    await sendAutoApprovedCommentNotification({
      comment: baseComment,
      aiReview: baseAiReview,
      notificationEmail: "",
      userEmail: "john@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "NOTIFICATION_EMAIL not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("does not send email when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;

    const consoleSpy = vi.spyOn(console, "warn");

    await sendAutoApprovedCommentNotification({
      comment: baseComment,
      aiReview: baseAiReview,
      notificationEmail: "admin@test.com",
      userEmail: "john@example.com",
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "RESEND_API_KEY not configured, skipping email notification",
    );

    consoleSpy.mockRestore();
  });

  it("throws when Resend API errors", async () => {
    process.env.RESEND_API_KEY = "test-api-key";

    mockSend.mockRejectedValueOnce(new Error("API Error"));

    await expect(
      sendAutoApprovedCommentNotification({
        comment: baseComment,
        aiReview: baseAiReview,
        notificationEmail: "admin@test.com",
        userEmail: "john@example.com",
      }),
    ).rejects.toThrow("API Error");
  });
});
