/**
 * AI review prompt template for comment moderation.
 * Constructs a detailed prompt that asks the AI to analyze comments for spam, toxicity,
 * relevance, coherence, and safety.
 */

/**
 * Builds a prompt for the AI to review a blog comment.
 * The prompt includes evaluation criteria and examples to guide the AI's assessment.
 *
 * @param commentText - The text content of the comment to review
 * @param postSlug - The slug of the blog post (for context)
 * @returns A structured prompt string for the AI model
 */
export function buildReviewPrompt(
  commentText: string,
  postSlug: string
): string {
  return `You are a content moderator for a travel blog. Your task is to review a comment and assess whether it should be approved or rejected.

**Blog Post:** ${postSlug}

**Comment to Review:**
"${commentText}"

**Evaluation Criteria:**

1. **Spam Detection**: Check for promotional content, generic text (e.g., "Nice pics!"), suspicious links, or irrelevant marketing for tours/hotels/services not mentioned in the post.

2. **Toxicity**: Check for harassment, hate speech, personal attacks, profanity, or hostile language.

3. **Relevance**: Ensure the comment is on-topic for a travel blog about itineraries, safaris, camping, hotels, and trip planning. Comments should relate to travel destinations, accommodations, activities, budgeting, or practical travel advice.

4. **Coherence**: Verify the comment is readable, makes sense, and appears to be written by a human (not bot-generated gibberish).

5. **Safety**: Check for dangerous content, illegal activities, phishing attempts, or malicious links.

**Examples of GOOD Comments (should approve):**
- "Thanks for this itinerary! How many days would you recommend for the safari portion? I'm trying to decide between 3 or 5 days."
- "I stayed at that hotel in Nairobi last year and can confirm the breakfast is amazing. Great tip about booking the corner rooms!"
- "Do you know if that campsite accepts reservations or is it first-come first-served? Planning a trip for June."
- "This is exactly the kind of detailed itinerary I needed. Did you need any special permits for the national park?"

**Examples of BAD Comments (should reject):**
- "Check out my travel agency for amazing safari deals! www.spamsite.com" (spam)
- "Your recommendations are trash and you clearly don't know what you're talking about" (toxic)
- "Nice post! Follow my Instagram for travel tips!" (spam + generic)
- "asdkfjhaskdjfh lkjsadflkj" (incoherent)

**Instructions:**
Analyze the comment and respond with a JSON object containing:

1. **confidenceScore** (number 0-1): How confident are you that this comment is safe and should be approved?
   - 0.9-1.0: Definitely safe, genuine, on-topic comment
   - 0.7-0.89: Probably safe, minor concerns
   - 0.4-0.69: Uncertain, needs human review
   - 0.0-0.39: Likely spam/toxic/problematic

2. **flags** (array of strings): List any concerns. Possible values:
   - "spam" - Promotional or generic content
   - "toxic" - Harassment, hate speech, or personal attacks
   - "off-topic" - Not relevant to travel content
   - "incoherent" - Unreadable or nonsensical
   - "unsafe" - Dangerous, illegal, or malicious content
   - Leave empty [] if no concerns

3. **reasoning** (string): Brief explanation (1-2 sentences) of your assessment.

Respond ONLY with valid JSON in this exact format:
{
  "confidenceScore": 0.95,
  "flags": [],
  "reasoning": "This is a genuine, thoughtful comment asking practical questions about the travel itinerary."
}`;
}
