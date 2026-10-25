# StayTimeline

The stays of the trip you are on, on Today, and of any trip on its overview. Shows where you are in the trip and what is left to book.

- A `title` header with the country, like China trip, and a `small` count on the right, like 4 stays · 1 not booked.
- One row per stay. Dates in `title`, a status in `small` under them, days in `small` on the right, then a chevron.
- Status says what each stay is. Done, Now, Back in N days, Booked or Not booked.
- One line in `stay-line` joins the stays so they read as one trip. The line into a stay is solid when it is booked, done or now, and dashed while it is not booked.
- Dots match. `done-dot` for done, a large `primary` dot with a `current-line` halo for now, a filled `primary` dot for booked, a hollow `primary` ring for not booked. The now row sits on `current`.
- A stay past the end of visa free or a visa gets a small coral warning icon after its dates. The row's screen reader label says the reason. Opening the stay explains it in one sentence.
- Tapping a stay opens Stay N of M. You can change its dates and turn on I booked travel for this stay. Later stays move along.
- The card ends with a Trip details row. It shows the total days, or a coral count like 1 to check when the whole trip has a problem that belongs to no single stay.
