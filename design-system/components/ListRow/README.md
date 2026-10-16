# ListRow

A trip or stay in a list. Plain rows with a hairline between rows. No leading circle, so nothing looks like a control you can tick.

- One line per row. Country on the left in `row`, 17 semibold ink. One value on the right in `body`, 15 muted, like the dates or 8 days left. Details like trip type and length live in the trip itself and in exports, not in the list.
- Section headers are small grey caps with no line under them. Lines only sit between rows.
- Status comes from the section heading, like Now, Upcoming or 2026, and from the purple key phrase on the right, like 8 days left.
- The current trip is highlighted with a full width band, edge to edge, in a very light purple `#F5F3FD`. No corners, so it stays part of the list. Text keeps the same size and weight as other rows, only the key phrase uses `primary-pressed`.
- No icons on dates.
- When stays form a sequence, like the plan on Home, use the timeline variant. A thin `line` connects small dots. The current stay is a 12 dot in `primary` with a `primary-soft` halo. Later stays are 8 dots in `control-off`.
- Numbered steps in a plan use a soft `primary-soft` disc with the number in `primary-pressed`. Never an outlined circle, which reads as a radio button.
