# Testing Strategy

## Tiers

| Tier      | Files                  | Tool             | Purpose                    |
| --------- | ---------------------- | ---------------- | -------------------------- |
| Unit      | `app/**/*.test.ts`     | Vitest           | Functions & modules        |
| Storybook | `app/**/*.stories.tsx` | Vitest (browser) | UI components in isolation |
| E2E       | `tests/e2e/`           | Playwright       | Key user scenarios         |
| Visual    | `tests/visual/`        | Playwright       | Screenshot regression      |

## Mocking rule

Own DB → real (seeded). External services (GitHub, Resend, etc.) → MSW.

## Coverage

Unit (`app/**/*.ts`) + Storybook (`app/**/*.tsx`) → one combined Codecov report.
E2E → confidence only, no coverage.
