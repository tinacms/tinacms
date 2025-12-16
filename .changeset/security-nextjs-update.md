---
"@tinacms/auth": patch
"next-tinacms-azure": patch
"next-tinacms-cloudinary": patch
"next-tinacms-dos": patch
"next-tinacms-s3": patch
"tinacms": patch
"tinacms-authjs": patch
---

🔒 Security: Update Next.js to 14.2.35 to address security vulnerabilities

- Address CVE-2025-55184 (high): DoS via malicious HTTP request causing server to hang
- Address CVE-2025-67779 (high): Complete fix for CVE-2025-55184 DoS vulnerability
- Updated Next.js devDependency from 14.2.10/14.2.24 to 14.2.35
- See: https://nextjs.org/blog/security-update-2025-12-11
