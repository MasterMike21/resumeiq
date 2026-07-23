/**
 * Sanitize candidate identifiers to prevent bias in screening.
 */
export const anonymizeResumeText = (rawText) => {
  if (!rawText) return "";

  let cleaned = rawText;

  // 1. Scrub Email Addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // 2. Scrub Phone Numbers
  cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]');

  // 3. Scrub LinkedIn/GitHub URLs
  cleaned = cleaned.replace(/https?:\/\/(www\.)?(linkedin|github)\.com\/[a-zA-Z0-9_-]+/gi, '[REDACTED_LINK]');

  // 4. Scrub Educational Institutions & College Names
  cleaned = cleaned.replace(/(University|Institute|College|School|Academy|UIET|Panjab University)/gi, '[REDACTED_INSTITUTION]');

  return cleaned;
};