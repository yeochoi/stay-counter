# Switch

An on and off row, used for Booked on a stay.

- A row in a card with the label in `body` on the left and the switch on the right, 56 tall.
- iOS style. Off, a flat light grey track with no outline. On, the track fills with `primary`. The white thumb has a soft shadow.
- The label uses the same grey row label style as Arrive and Leave, so the switch reads as that row's value.
- The whole row is the target, with role switch and its checked state for screen readers.
- Only shown on stays that have not started. Booked is only what the person says, the app never turns it on.
