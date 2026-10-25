# Stay Counter

Know your days, wherever you are. A calm travel days counter that tells people living between countries how long they can stay, when to leave, and how close they are to a tax limit. It runs as a responsive web app on phones and laptops.

## Principles

1. **One answer per screen.** The hero answers one question with one number and one date, like 20 days left and Leave China by Sat, Nov 7. Everything else waits below.
2. **Dark hero, light content.** A deep purple hero carries the answer. Content sits below on a warm off white in white cards.
3. **Purple acts, coral warns.** Purple is for actions, progress and the stay you are in. Coral only appears when something needs checking.
4. **Never guess for the person.** Show only dates the person entered or the app knows. A stay is Booked only when the person says so, never because they saved it.
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

Four styles, three sizes, two weights. The same scale runs across Stay Counter, Shuo and Manna.

| Style | Size | Weight | For |
| --- | --- | --- | --- |
| `display` | 34, 44 on laptop | Semibold | The one answer, page titles, first open headline |
| `title` | 15 | Semibold | Section headers, stay dates, country names, buttons, sheet titles |
| `body` | 15 | Regular | Everything you read, row labels, values, hero labels |
| `small` | 13 | Regular | Status, days, notes, chips, warnings, tab labels |

Text inputs use 16 so iOS does not zoom. The ring number is 28, 34 on laptop, so the date beside it leads.

Rules
- Only 400 and 600. A header differs from text by weight only, never by size. Chips use regular weight, their fill already stands out.
- Large text uses minus 0.02em letter spacing.

## Layout

- Phones use a 22 side margin on every screen and sheet.
- Laptops keep the hero colour full width and place content inside `max-width` of 1040, all on one left edge.
- Sections start with a `title` header in ink 22 above the card. A count or note can sit on the right in `small`. Cards are white with a 1px `line` border and `radius-card`. No shadows.
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

- Show each problem once, where it lives.
- A problem with one stay is a small coral icon next to that stay's dates. The row's screen reader label says the reason, and the stay screen explains it in one sentence.
- A problem with the whole trip, like a tax limit or a single entry visa, is a count on Trip details, like 1 to check. Without one, Trip details shows the total days.
- On the trip overview, the rules card says each problem in a small `coral-text` line under its rule, with one chip under the answer.
- A new trip's plan, before it is saved, shows its warnings in one coral box, since it has no rules card.

## Stays

- A long trip splits into stays, one per entry. The app suggests where to leave and come back.
- One line joins the stays so they read as one trip. Grey means done, purple means ahead. The line is `done-dot` grey between finished stays and into the stay you are in now, then `stay-line` purple, solid into a booked stay and dashed into one not booked. Dividers sit between stays, except next to Now.
- Each stay says what it is. Done, Now, Back in N days, Booked or Not booked.
- Booked is only what the person says. The stay screen has one switch, Booked. It never names flights, people also travel by train, ferry or car.
- Dots and line show the same thing. Grey dot for done, large dot with a halo for now, filled dot for booked, hollow dot for not booked. The line into a stay is dashed while it is not booked and solid once it is booked, done or now.
- A trip is Booked when every stay ahead is booked. Otherwise lists say Planning, Not booked or 1 of 2 booked. Only a trip with one stay asks Planning or Booked on Edit trip.
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
