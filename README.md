# Stay Counter

Know your days, wherever you are.

Stay Counter tells people who live between countries how long they can stay and when to leave. Plan a long stay before you book, or track a trip while you are there.

**Try it** at https://yeochoi.github.io/stay-counter/

On iPhone, open the link in Safari, tap Share, then Add to Home Screen. It opens full screen and works offline.

## What it does

- **Plan a stay.** Enter a country and rough dates. It splits the stay into entries, so you know when to leave and how many times. Example. China visa free allows 30 days per entry, so Nov 1, 2026 to Mar 31, 2027 needs 4 exits.
- **Track a trip.** During a stay, Today shows a countdown ring and the leave by date.
- **Watch your limits.** It warns when a visa free policy ends and when you reach 183 days in a country.
- **Keep a record.** Trips lists past trips by year and exports them as a CSV for tax or HR.

Trips stay on the phone. Nothing is sent anywhere. This is general information, not legal or tax advice.

## Design system

The app is built on its own design system, in [`design-system/`](design-system/README.md). Colors, type and spacing live in [`tokens.json`](design-system/tokens.json) and each component has a README and a preview. Inside the app, open Settings and tap Design system to see it live.

## Run it

```bash
npm install
npm run dev
```

Every push to `main` publishes the site through GitHub Actions.

## Project

- `src/lib` holds dates, entry rules and the plan math
- `src/screens` holds the screens
- `src/styles.css` holds the design tokens as CSS variables

Designed by YK Choi, built with Claude.
