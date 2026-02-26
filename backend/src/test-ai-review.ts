/**
 * Quick test script to verify Gemini API integration.
 * Run with: npm run test:ai
 */

import "dotenv/config";
import { reviewComment } from "./services/ai-review";
import { healthCheck } from "./services/gemini-client";

async function testAIReview() {
  console.log("=== Testing Gemini API Integration ===\n");

  // Test 1: Health check
  console.log("Test 1: Health Check");
  try {
    const isHealthy = await healthCheck();
    console.log(`✅ Health check ${isHealthy ? "PASSED" : "FAILED"}\n`);
  } catch (error) {
    console.error("❌ Health check failed:", error);
    console.log("\nMake sure GEMINI_API_KEY is set in backend/.env\n");
    process.exit(1);
  }

  // Test 2: Good comment (should have high confidence)
  console.log("Test 2: Review a GOOD comment");
  try {
    const goodComment =
      "This is a great itinerary! How many days would you recommend for the safari portion? I'm trying to decide between 3 or 5 days.";
    const result1 = await reviewComment(goodComment, "test-safari-itinerary");
    console.log(`✅ Good comment result:`);
    console.log(
      `   Confidence: ${(result1.confidenceScore * 100).toFixed(1)}%`,
    );
    console.log(
      `   Flags: ${result1.flags.length > 0 ? result1.flags.join(", ") : "None"}`,
    );
    console.log(`   Reasoning: ${result1.reasoning}\n`);
  } catch (error) {
    console.error("❌ Good comment test failed:", error);
  }

  // Test 3: Spam comment (should have low confidence)
  console.log("Test 3: Review a SPAM comment");
  try {
    const spamComment =
      "Check out my travel agency for amazing safari deals! Visit www.example.com for discounts!";
    const result2 = await reviewComment(spamComment, "test-safari-itinerary");
    console.log(`✅ Spam comment result:`);
    console.log(
      `   Confidence: ${(result2.confidenceScore * 100).toFixed(1)}%`,
    );
    console.log(
      `   Flags: ${result2.flags.length > 0 ? result2.flags.join(", ") : "None"}`,
    );
    console.log(`   Reasoning: ${result2.reasoning}\n`);
  } catch (error) {
    console.error("❌ Spam comment test failed:", error);
  }

  // Test 4: Toxic comment (should have low confidence)
  console.log("Test 4: Review a TOXIC comment");
  try {
    const toxicComment =
      "Your recommendations are trash and you clearly don't know what you're talking about";
    const result3 = await reviewComment(toxicComment, "test-safari-itinerary");
    console.log(`✅ Toxic comment result:`);
    console.log(
      `   Confidence: ${(result3.confidenceScore * 100).toFixed(1)}%`,
    );
    console.log(
      `   Flags: ${result3.flags.length > 0 ? result3.flags.join(", ") : "None"}`,
    );
    console.log(`   Reasoning: ${result3.reasoning}\n`);
  } catch (error) {
    console.error("❌ Toxic comment test failed:", error);
  }

  console.log("=== All tests complete! ===");
}

testAIReview().catch(console.error);
