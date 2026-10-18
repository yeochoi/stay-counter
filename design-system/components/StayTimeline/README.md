# StayTimeline

The stays of the trip you are on, on Today. Answers where am I in this trip at a glance.

- A section label with the country, like China trip, and the whole trip on the right, like Sep 8 – Nov 17 · 69 days.
- One row per stay. The dates in `headline`, a status line in `note` under it, the days on the right.
- Status says what each stay is. Done, Now with days left, Back in N days, Suggested, or Matched to flights.
- Dots match. `done-dot` for done, a filled `primary` dot with a `current-line` halo for now, an empty `primary` ring for next. The now row sits on `current`.
- A stay past the end of visa free or a visa adds a coral line, After visa free ends.
- Tapping a stay opens Stay N of M to match it to flights. Later stays move along.
