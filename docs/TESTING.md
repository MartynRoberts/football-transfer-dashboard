# Testing

The dashboard uses Jest and React Testing Library to verify behaviour from a
user's perspective while keeping football-data calculations covered by fast,
deterministic unit tests.

## Tooling

- **Jest** runs the test suite and produces coverage reports.
- **JSDOM** provides a browser-like environment for component tests.
- **React Testing Library** renders components and queries their accessible UI.
- **user-event** simulates realistic user interactions.
- **jest-axe** checks rendered components for common accessibility violations.
- **next/jest** applies the project's Next.js and TypeScript configuration.

Configuration is defined in `jest.config.ts`. Shared test setup and mocks are
defined in `test/setup.tsx`.

## Commands

Run the complete suite once:

```powershell
npm test
```

Run affected tests interactively during development:

```powershell
npm run test:watch
```

Generate an HTML and terminal coverage report and enforce the configured
thresholds:

```powershell
npm run test:coverage
```

The HTML report is written to `coverage/lcov-report/index.html`.

Before submitting a change, run the full verification set:

```powershell
npm test
npm run test:coverage
npm run lint
npx tsc --noEmit
```

## Test organisation

Tests are colocated with the code they cover and use the `.test.ts` or
`.test.tsx` suffix:

```text
app/
  leagues/page.test.tsx
components/
  clubs/ClubLogo.test.tsx
  navigation/SectionNav.test.tsx
  players/TransferHistory.test.tsx
lib/
  dashboard/get-home-page-data.test.ts
  transfers/formatters.test.ts
test/
  setup.tsx
```

The suite is divided into several complementary layers.

### Business-rule tests

Pure functions are tested without rendering React components. Current coverage
includes:

- transfer fee, type, market-value, and value-rating formatting;
- current and historical season calculations;
- net-spend formatting;
- injury absence percentages and recurrent-injury detection;
- player age calculations; and
- market-value timeline sorting, spacing, and yearly ticks.

These tests should be the first choice for calculations because they are fast
and give precise failures.

### Component tests

React Testing Library tests verify visible content and accessible semantics,
including:

- UK-formatted transfer and injury dates;
- correct From and To club direction;
- mobile table-card labels;
- club-logo loading and failure states;
- menu and search behaviour; and
- empty states and links.

Tests query by role, label, and visible text wherever possible. Avoid querying
implementation-specific class names unless the class is itself the behaviour
under test, such as the hidden-to-visible club-logo transition.

### Interaction tests

The section navigation suite verifies active links, smooth section scrolling,
URL hashes, and the back-to-top control. Browser APIs that JSDOM does not
implement are supplied by `test/setup.tsx`.

### Data-access and page tests

Prisma is mocked so tests never require a database or mutate development data.
The home-page data test checks the shape of the generated query, including the
rule that future transfers must not appear in Latest transfers. The Leagues
page test supplies representative records and verifies the rendered page.

### Accessibility tests

`jest-axe` provides smoke coverage for key rendered interfaces. Direct
assertions are still used for important semantics such as heading levels,
`aria-current`, link destinations, and accessible control names.

Automated accessibility tests catch common issues but do not replace keyboard,
screen-reader, colour-contrast, and responsive manual testing.

## Shared mocks

`test/setup.tsx` contains project-wide mocks for:

- `next/image`, rendered as a native image without forwarding Next.js-only
  properties;
- `next/link`, rendered as an anchor while preventing unsupported JSDOM page
  navigation;
- `IntersectionObserver`;
- `scrollIntoView`; and
- element and window `scrollTo` methods.

Add a global mock only when most tests need it. Feature-specific mocks should
remain in the relevant test file so their behaviour is explicit.

When mocking Prisma, create `jest.fn()` methods inside the `jest.mock` factory,
then import and cast those methods for test setup. Jest hoists mock factories,
so referencing ordinary variables declared above a factory can cause an
initialisation error.

## Dates and time

Tests involving the current date must use Jest fake timers:

```ts
jest.useFakeTimers().setSystemTime(new Date("2026-08-12T12:00:00Z"));

// Run the code under test.

jest.useRealTimers();
```

Use explicit ISO timestamps, preferably with `Z`, to avoid tests changing with
the machine's local timezone. User-facing dates should be asserted in UK
`DD/MM/YYYY` format.

## Coverage policy

The global coverage thresholds are intentionally achievable across a Next.js
component tree:

| Metric | Minimum |
| --- | ---: |
| Statements | 60% |
| Lines | 60% |
| Branches | 60% |
| Functions | 55% |

Transfer business-rule modules have a stricter 90% threshold for every metric.
These calculations directly affect fees, ratings, labels, and seasons, so a
higher standard is appropriate.

Coverage is a guardrail, not the objective. Prefer tests that protect user
behaviour and business rules over tests written only to execute uncovered
lines. Generated Prisma code, framework internals, and exact Recharts SVG paths
should not be tested directly.

## Adding a test

1. Place the test next to the production file it covers.
2. Describe behaviour rather than implementation details.
3. Use a pure unit test for calculations and React Testing Library for UI.
4. Mock network and database boundaries; never depend on live services.
5. Include missing, null, empty, and boundary cases where relevant.
6. Add an accessibility assertion for new major interactive views.
7. Run the full verification commands before committing.

A typical component test follows this pattern:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("opens the navigation menu", async () => {
  const user = userEvent.setup();
  render(<MobileMenu />);

  await user.click(screen.getByRole("button", { name: "Toggle menu" }));

  expect(screen.getByRole("link", { name: "Clubs" })).toHaveAttribute(
    "href",
    "/clubs",
  );
});
```

## Current suite

The initial suite contains 46 tests across 14 suites. It covers the highest-risk
behaviour identified during development, including UK dates, future-transfer
filtering, transfer labels, market-value timelines, responsive card markup,
sticky section navigation, failed club badges, and accessibility semantics.
