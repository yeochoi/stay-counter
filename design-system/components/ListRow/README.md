# ListRow

A trip in a list. On phones two lines, on laptops one table row.

- Phones. Country in `title`, then one `small` in `muted` with dates, days in the country and type, like Sep 26 – Oct 2 · 7 days · Personal. Planning is added for a future trip with one stay not yet booked. A trip with several stays says how many are booked, like 1 of 2 booked, or Not booked.
- Laptops. One row with aligned columns for country, dates, days and type, with no header row. The last column has a fixed width so rows line up across cards.
- The trip you are in sits in its own card on `current` with a `current-line` border and a Now chip with days left.
- Every row has a chevron and opens the trip overview.
- Trips is split by tabs, Upcoming and Past. Past groups by year.
