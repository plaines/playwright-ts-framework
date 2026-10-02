import { expect as baseExpect, Locator } from '@playwright/test';
import { ZodType } from 'zod';

/**
 * Custom matchers that keep the native `expect(x).toSomething()` syntax.
 */
export const expect = baseExpect.extend({
  /** Validates any value (usually a deserialized response body) against a Zod schema. */
  toMatchSchema(received: unknown, schema: ZodType) {
    const result = schema.safeParse(received);
    const issues = result.success
      ? ''
      : result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    return {
      name: 'toMatchSchema',
      pass: result.success,
      message: () =>
        result.success ? 'Expected value NOT to match the schema' : `Schema validation failed:\n${issues}`,
    };
  },

  /** Web-first: retries until every element in the locator has exactly `expected` as text. */
  async toHaveOnlyText(locator: Locator, expected: string, options?: { timeout?: number }) {
    let actual: string[] = [];
    let pass: boolean;
    try {
      await baseExpect
        .poll(async () => {
          actual = (await locator.allInnerTexts()).map((t) => t.trim());
          return actual.length > 0 && actual.every((t) => t === expected);
        }, options)
        .toBe(true);
      pass = true;
    } catch {
      pass = false;
    }
    return {
      name: 'toHaveOnlyText',
      pass,
      message: () => `Expected all elements to have text "${expected}", received: ${JSON.stringify(actual)}`,
    };
  },
});
