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
const { sendNewCommentNotification } = await import("./email");

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

  it("includes reply-to email when REPLY_TO_EMAIL is set", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";
    process.env.FROM_EMAIL = "noreply@test.com";
    process.env.REPLY_TO_EMAIL = "personal@example.com";

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test comment",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "personal@example.com",
      }),
    );
  });

  it("does not include reply-to when REPLY_TO_EMAIL is not set", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.NOTIFICATION_EMAIL = "admin@test.com";
    process.env.FROM_EMAIL = "noreply@test.com";
    delete process.env.REPLY_TO_EMAIL;

    mockSend.mockResolvedValueOnce({ id: "test-id" });

    await sendNewCommentNotification({
      postSlug: "test-post",
      commentBody: "Test comment",
      userName: "Test User",
      userEmail: "test@example.com",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.replyTo).toBeUndefined();
  });
});
