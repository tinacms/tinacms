---
'tinacms': patch
'@tinacms/app': patch
---

Revert the final-form family to v4 so edits inside nested panels survive navigating back

`react-final-form` 7.0.1 resets a field to its initial value whenever it mounts at a path that has no registered field. The sidebar unmounts the parent field set every time you open a group, an object-list item or a block, so on the way back the parent field remounted and was reset, throwing away every unsaved edit made inside the panel. Reported in 3.12.1 as "I have to save each list item before backing out".

Back to `final-form` 4.20.10, `final-form-arrays` ^3.1.0 and `react-final-form` ^6.5.9 until the upstream fix (final-form/react-final-form#1096) ships.
