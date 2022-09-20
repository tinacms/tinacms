---
'@tinacms/cli': patch
'@tinacms/scripts': patch
'create-tina-app': patch
---

Remove the use of ESM package, which allowed CJS scripts to run as ES modules. This was initially used for yarn pnp support but is no longer necessary.
