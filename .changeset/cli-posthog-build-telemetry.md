---
"@tinacms/cli": patch
---

Track `tinacms build` invocations + outcomes in PostHog. Replaces the `metrics.tina.io` event for this command. Opt-out via `--noTelemetry` is unchanged.
