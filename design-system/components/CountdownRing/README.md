# CountdownRing

The hero of Today. One number in a ring, one labelled date beside it.

- `size-ring` ring on `hero`, with no filled disc. A 6px track in white at 16 percent always shows the whole circle, so every state looks like the same component.
- During a stay a 6px arc in `ring` runs inside the track with round ends, showing how much of the stay is left. The number is days left, counted from tomorrow.
- Before a trip, or on a day between stays, there is no arc, only the track, with days to go.
- The number is 28 semibold, 34 on laptops, and the unit is `small`, so the date beside it in `display` leads.
- Nothing else in the hero during a stay. No stay count, no next entry chip.
