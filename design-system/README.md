# Stay Counter

Know your days, wherever you are. A calm iOS app that tells people living between countries how long they can stay and when to leave.

## Principles

1. **One answer per screen.** Every screen leads with one big thing, a date or a number. Everything else is quiet.
2. **Lists, not cards.** Content sits in plain lists with hairline dividers, like Todoist. Grouped white rows appear only inside forms.
3. **Purple acts, coral warns.** Purple is for actions and progress. Coral only appears when something needs attention. Everything else is ink and grey.
4. **Every number has a label.** A date or count never stands alone. 17 days to go, Leave by Mon, Nov 30.
5. **Native first.** System font, iOS sheets, tab bar and controls, so the app feels at home on an iPhone.

## Color

| Role | Token | Use it for |
| --- | --- | --- |
| Brand | `primary` | Main button, ring, add button, selected tab, the one key phrase |
| Soft brand | `primary-soft` with `primary-pressed` text | Secondary button, next trip circle |
| Attention | `secondary` and `secondary-ink` | Last 5 days of a stay, limits getting close |
| Ground | `bg`, `surface` | Screens and grouped rows |
| Text | `ink`, `muted` | Content and supporting text |
| Lines | `line`, `control-off` | Dividers and empty circles |

Text uses five colors, each with one job.

| Text color | Token | For | Contrast on bg |
| --- | --- | --- | --- |
| Ink | `ink` | Names, titles, body | 16.1 to 1 |
| Grey | `muted` | Section headers, values on the right, notes | 5.0 to 1 |
| Purple | `primary-pressed` | Links and the one key phrase | 7.7 to 1 |
| Coral | `secondary-ink` | A value close to its limit | 4.9 to 1 |
| White | white | Text on purple buttons | 5.4 to 1 |

Rules
- Brand purple `primary` is for fills and graphics. Purple text always uses `primary-pressed`.
- In every row, the name is `row`, 17 semibold ink, and the value is `body`, 15 regular grey. Plan timelines keep dates at 17 regular, with only the current stay in semibold. The difference in both size and color makes label and detail easy to tell apart, like Prayminder's title and time.
- Names are ink, values are grey. Past trips are not dimmed further, the year heading already says they are done.
- Use purple at most three times on a screen.
- Coral never decorates. If nothing needs attention, there is no coral.
- Grey text always uses `muted`, which passes contrast. Never lighter.
- `control-off` empty circles are decorative and always sit next to a text label.

## Typography

SF Pro, Apple's system font. Six sizes, three weights, nothing in between.

| Style | Size | Weight | For |
| --- | --- | --- | --- |
| `large-title` | 30 | Bold | Screen title, big numbers |
| `title` | 24 | Bold | The key answer, like Mon, Nov 30 |
| `headline` | 17 | Semibold | Buttons, sheet titles |
| `row` | 17 | Regular | The name on the left of every row |
| `body` | 15 | Regular | Values on the right of rows, short text, switches |
| `footnote` | 13 | Regular | Lines under a row, section labels |
| `caption` | 11 | Semibold | Tab bar only |

Rules
- Weights are Regular for reading, Semibold for actions, Bold for the few big things.
- Titles use a slight negative letter spacing of minus 0.02em. Nothing else is tracked.
- In SwiftUI these map to largeTitle, title2, headline, subheadline, footnote and caption2, so Dynamic Type works.

## Layout

- Screens are 390 wide with one side margin, `space-5` of 22, on every screen and sheet.
- Edges align, content insets. Text, labels, buttons and the edges of boxes all start at 22. Text inside a box, like grouped rows or the warning, is inset by `space-4` of 16.
- The only things that cross the margin are full width bands, like the current trip on Trips and the warnings on the plan. Their content still starts at 22, so it lines up with the list around it.

Headers on tab screens
- One structure on every tab. A small grey line of 18, a gap of 2, then a 44 tall row with the large title on the left and one icon button on the right, centered on the title line.
- Screens without a date keep the 18 line empty, so titles sit at the same height on every tab.
- Icon buttons are 44 square with the icon's right edge on the 22 margin.

Sheet bars
- A 44 tall row with three columns, left action, centered title, right action, all centered on one line.
- Order from the top. Large title with one grey line under it, then the hero, then lists, then actions at the bottom.
- Sections start with a header in 12 semibold `muted`, uppercase with 0.08em letter spacing. No line under it. Gaps between sections are measured from the last thing you can see, always 44. After a band, a line or the hero that is 44 of padding. After a plain row with no line, the row already carries 16 of empty space, so the header gets 28. The caps shape keeps it apart from grey values.
- Every label uses the same small grey caps, in lists and in the hero, like NEXT TRIP and LEAVE CHINA BY. The date above the Today title uses it too, like THU, OCT 15.
- Three text levels in lists, each different in two ways. Header small grey caps. Country 17 semibold ink. Value 15 regular muted.
- Rows are separated by a hairline under each row. No line above the first row.
- Never show the same trip twice on one screen. If it is the hero, it does not also appear in the list below.
- Primary actions sit at the bottom within thumb reach.

## Navigation

- **Root screens** are Today and Trips in a two tab bar. Settings is a gear at the top right of Today.
- The large title always names the tab you are on, matching its tab label. The app name never appears as a title.
- **Tasks** like a new trip open as a sheet. Left is Cancel or Back, right is Done or Close.
- **Done** confirms a step. **Save trip** is the only save, at the end.

## Components

- **Button.** Full width pill, 54 tall. Primary is purple with white text. Secondary is soft purple with purple text. One primary per screen.
- **Add button.** 56 round purple button with a plus, bottom right, above the tab bar. Only on Home.
- **Segmented switch.** Pill track in `line` with a white pill thumb. For two choices, like Planning or Booked.
- **Grouped rows.** White rows with a `radius-group` corner, label left and value right in muted.
- **List row.** One line. Name on the left, one value on the right. No leading circle. Stays in a sequence use a thin timeline with small dots, the current one in purple.
- **Countdown ring.** 104 circle. During a stay a ring fills with purple, coral in the last 5 days. Before a trip it is a soft purple disc with days to go.
- **Warning.** One group under a single coral icon, ink text, one line per warning, on a very light tint. No dividers.

## Shape

- No drop shadows on buttons, including the round add button. Flat fills only. The one soft shadow left is the selected thumb in a segmented switch.

- Things you tap are round, with `radius-pill`.
- Things you read are softly square, with `radius-group`.

## Data

- Time at home is not a trip. Home days count only in the 12 month totals, never in the Trips list.

## Writing

- Plain words, sentence case, short.
- Same phrase for the same idea everywhere. Deadlines always say Leave by.
- Short dates in lists, like Dec 31.
- When a weekday is shown, it is always the short form with a comma, like Mon, Nov 30. Never the full Monday. Weekdays appear only on single dates people act on, like the leave by date, the arrive and leave fields, and today's date above the title.
- No colons, semicolons or dashes in UI text, with one exception below.

Date ranges
- Ranges use a spaced en dash, like Nov 1 – 30. This is the only dash in the app.
- Same month, say it once. Nov 1 – 30.
- Different months, say both. Dec 2 – Jan 31.
- Show the year whenever a date is not in the current year. Apr 3 – 10, 2027.
- A range that crosses into a new year shows both years. Nov 1, 2026 – Mar 31, 2027.
- Past trips sit under a year heading, so their rows skip the year.
- Exports always show full dates with the year.
- Labels over questions when the options explain themselves.
- Keep Not legal advice on any screen that shows rules.

## Icons

Apple SF Symbols in the app, at the outline weight that matches the text. Filled only for the selected tab. No emoji.

Large icons on intro and empty screens follow one style. 64 wide, thin outline, in a light purple, with no tile or fill behind them. They set the mood and stay quiet, so the purple button below is always the strongest thing on the screen.

## Hierarchy

Every screen has three levels and only three.
1. The answer. Large title or title, bold. One per screen.
2. Section headers. Small, semibold, grey.
3. Rows. One line of body text, with one value on the right. Only the one value that needs attention gets purple or coral.

## Less text

If a detail is not needed to decide or act on this screen, leave it for the next tap. Prefer one line per row, and avoid a grey second line unless it changes what the user does.
