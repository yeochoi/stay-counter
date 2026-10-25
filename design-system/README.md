# Stay Counter

Know your days, wherever you are. A calm travel days counter that tells people living between countries how long they can stay, when to leave, and how close they are to a tax limit. It runs as a responsive web app on phones and laptops.

## Principles

1. **One answer per screen.** The hero answers one question with one number and one date, like 20 days left and Leave China by Sat, Nov 7. Everything else waits below.
2. **Dark hero, light content.** A deep purple hero carries the answer. Content sits below on a warm off white in white cards.
3. **Purple acts, coral warns.** Purple is for actions, progress and the stay you are in. Coral only appears when something needs checking.
4. **Never guess for the person.** Show only dates the person entered or the app knows. A date the app proposes says Suggested until the person matches it to a flight.
5. **One way to do each thing.** Top left always leaves a sheet, the bottom always moves forward, the same warning always looks the same.

## Color

| Role | Tokens | Use |
| --- | --- | --- |
| Hero | `hero`, `hero-text`, `ring` | Top of Today and Trips, the laptop top bar, the first open screen |
| Action | `primary`, `purple-text`, `soft` | Buttons, Now, dots, bars, links, Edit |
| Current | `current`, `current-line` | The stay or trip you are in now |
| Ground | `bg`, `surface`, `line` | Screens, cards, dividers |
| Text | `ink`, `muted` | Content and labels |
| Quiet | `chip`, `chip-text`, `chevron`, `done-dot` | Notes, round buttons, chevrons, finished stays |
| Attention | `coral`, `coral-text`, `coral-soft`, `coral-track` | Rules to check, stays after an entry ends, tax limits close by |

Rules
- `primary` is a fill. Purple text always uses `purple-text`.
- Coral text always uses `coral-text`. `coral` is only for bars.
- Text passes 4.5 to 1 everywhere it sits. The token notes list each pair.

## Typography

One typeface, Outfit, from Google Fonts. No serif anywhere.

Four sizes, two weights. The same scale runs across Stay Counter, Shuo and Manna.

| Style | Size | Weight | For |
| --- | --- | --- | --- |
| `display` | 34, 44 on laptop | Semibold | The answer, the ring number, page titles, first open headline |
| `title` | 17 | Semibold | Stay dates, country names, buttons, sheet titles |
| `body` | 15 | Regular | Row labels, values, hero labels, tabs, links |
| `label` | 13 | Semibold | Section labels, eyebrows, phone tab bar |
| `small` | 13 | Regular | Notes, chips, status, warnings, second lines |

Text inputs use 16 so iOS does not zoom. That is the only other size.

Rules
- Only 400 and 600. Bold only for titles and labels. Chips use regular weight, their fill already stands out.
- Large text uses minus 0.02em letter spacing.
- Text next to the ring uses the same sizes as the ring. The number and the date share `display`, the unit and the label share `body`, so tops and bottoms line up.

## Layout

- Phones use a 22 side margin on every screen and sheet.
- Laptops keep the hero colour full width and place content inside `max-width` of 1040, all on one left edge.
- Sections start with a `label` 20 above the card. Cards are white with a 1px `line` border and `radius-card`. No shadows.
- The add button floats bottom right and never covers content, the page leaves room under the last card.

## Navigation

- Phones have a bottom tab bar with Today and Trips. Laptops move them to a top bar on `hero` with Stay Counter on the left.
- Settings sits behind the gear on Today.
- A chevron means a row opens something. Rows without one only show information. On laptops only rows with a chevron react to the mouse.
- Sheets have one rule. Top left leaves, × closes a first screen, ‹ goes back one step. The bottom holds one forward action, like See stays, Save trip or Save. Reading pages, like Settings, have no bottom button.
- A saved trip opens on its overview first. Edit at the top right opens Edit trip. Viewing never needs the form.

## Screens

- **Today.** Hero with the answer. Below it the current trip as a timeline, then Upcoming, then Tax days.
- **Trips.** Tabs Upcoming and Past. Upcoming shows Now first. Past groups by year. On laptops each trip is one table row with country, dates, days and type.
- **Trip overview.** The answer, the stays, Rules for this trip, then Details.
- **New trip.** Starts empty. Country, dates, entry and type, then See stays, then Save trip.

## Warnings

- One icon per screen, in a coral chip under the answer, like 2 rules to check. See below.
- Every other warning is one small `coral-text` line under the thing it is about, like After visa free ends under a stay or You reach it on Dec 12 under the tax limit.
- Values keep their normal style. Only the line under them is coral.
- A new trip's plan, before it is saved, shows its warnings in one coral box, since it has no rules card.

## Stays

- A long trip splits into stays, one per entry. The app suggests where to leave and come back.
- Each stay says what it is. Done, Now with days left, Back in N days, Suggested, or Matched to flights.
- Dots show the same thing. Grey for done, filled with a halo for now, empty for next.
- Editing a stay moves the stays after it. The edit screen says when the next stay can start.
- Finished stays can still be corrected. A grey note says so.

## Counting

- Days count both arrival and leave days.
- Days left count from tomorrow, so the number matches a calendar.
- Tax days follow each country's own rule, the calendar year for China, the past 12 months elsewhere. Home is not listed.

## Writing

- Plain words, sentence case, short. No colons, semicolons or dashes in UI text.
- Date ranges are the one exception and use a spaced en dash, like Nov 1 – 30. A range into the next year names the year once, like Nov 1 – Mar 31, 2027.
- Weekdays only on single dates people act on, like Sat, Nov 7.
- Calm words for problems, like rules to check, never broken.
- Keep Not legal advice on any screen that shows rules.

## Files

This folder is a copy of the Stay Counter design system artifact. `tokens.json` holds every colour, type style, spacing, radius and size. `tokens.css` is generated from it for use in code. Each folder in `components` has a guide and a live preview. `scripts/build-design-system.mjs` turns this folder into the page at `/stay-counter/design-system/` on every build, so the page always matches these files.
