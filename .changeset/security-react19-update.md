---
"tinacms-clerk": patch
---

🔒 Security: Pin React 19 to 19.2.3 to address security vulnerability

- Added scoped pnpm override to ensure @clerk/clerk-js and @clerk/backend dependencies resolve to React 19.2.3
- Addresses CVE in React 19 versions prior to 19.2.3
- React 18.x is unaffected and remains unchanged
