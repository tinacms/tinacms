---
"create-tina-app": patch
---

Bump `systeminformation` from `^5.27.13` to `^5.31.7`, which fixes four command-injection advisories. Machines where `systeminformation` cannot read a hardware UUID now get a random anonymous telemetry ID instead of all sharing one.
