# CountdownRing

The hero of Today. One number in a ring, one labelled date beside it.

- `size-ring` circle on `hero`. A faint white track always shows, so every state looks like the same component.
- During a stay the arc fills in `ring`, showing how much of the stay is left. The number is days left, counted from tomorrow.
- Before a trip, or on a day between stays, there is no arc, only the track, with days to go.
- The number and the date both use `answer`, the unit and the label both use `body`, so the tops and bottoms line up.
- Nothing else in the hero during a stay. No stay count, no next entry chip.
