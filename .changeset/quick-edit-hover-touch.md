---
"@tinacms/bridge": patch
---

Stop the quick-edit hover highlight from flooding the screen on touch devices. The blue fill (the full-bleed wash and the overlay reveal) is now gated behind `@media (hover: hover)`, so on a tablet it no longer stays stuck over the last-tapped field. The solid outline still appears on tap as selection feedback, and the resting dashed outline is unchanged.
