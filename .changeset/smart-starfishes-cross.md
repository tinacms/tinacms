---
'@tinacms/toolkit': patch
---

Ensure `error` is a string before rendering it from field meta component. In situations where an object's sub-field was invalid, touching the sub-field would trigger this error to be an object at the parent, React throws an error when trying to render an object
