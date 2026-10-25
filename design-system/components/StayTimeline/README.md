# StayTimeline

The stays of the trip you are on, on Today, and of any trip on its overview. Shows where you are in the trip and what is left to book.

- A header with the country, like China trip, and nothing else. Each stay already says whether it is booked.
- One row per stay. Dates in `title`, a status in `small` under them, days in `small` on the right, then a chevron.
- Status says what each stay is. Done, Now, Back in N days, Booked or Not booked.
- One line joins the stays so they read as one trip. Grey means done, purple means ahead. The line is `done-dot` grey between finished stays and into the stay you are in now, then `stay-line` purple, solid into a booked stay and dashed into one not booked.
- Dividers sit between stays and start at the text. None touch the Now row, its purple edge already separates it. No divider under the last stay.
- Dots match. `done-dot` for done, a large `primary` dot with a `current-line` halo for now, a filled `primary` dot for booked, a hollow `primary` ring for not booked. The now row sits on `current`.
- A stay past the end of visa free or a visa gets a small coral warning icon after its dates. The row's screen reader label says the reason. Opening the stay explains it in one sentence.
- Tapping a stay opens Stay N of M. You can change its dates and turn on Booked. Later stays move along.
- The card ends with a Trip details row. It shows the total days, or a coral count like 1 to check when the whole trip has a problem that belongs to no single stay.
