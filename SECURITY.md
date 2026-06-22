# Security Policy

## Supported Versions

We only support the latest version of TinaCMS. If you are experiencing a security issue and are not on the latest version, please update to the latest version to see if the issue persists.

| Version | Supported          |
| :------ | :----------------- |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

We take the security of TinaCMS seriously. If you believe you have found a security vulnerability in the latest version of TinaCMS, please report it to us as described below.

**Do not report security vulnerabilities through public GitHub issues.**

### How to Report

Please email us directly at **security@tina.io**.

You can also find our security contact details in our [security.txt](https://tina.io/.well-known/security.txt).

### What to Include

To help us triage and resolve the issue quickly, please include:
- The specific package(s) affected (e.g., `tinacms`, `@tinacms/cli`, etc.)
- The version of the package where the vulnerability was found (must be the latest).
- A proof-of-concept or detailed steps to reproduce the issue.
- Any relevant configuration files (sanitized of secrets).

### Response Timeline

- We will acknowledge receipt of your report.
- We aim to provide a preliminary assessment or triage quickly.
- We will notify you when a fix has been released.

Thank you for helping keep TinaCMS safe!

## Dependency Updates and Supply-Chain Policy

A freshly published package version is a supply-chain risk. Compromised or malicious releases are most often caught and yanked within the first couple of days, so we let new versions age before pulling them in.

Dependabot is configured with a 3-day cooldown in [`.github/dependabot.yml`](.github/dependabot.yml), so automated update PRs never propose a release younger than 3 days. A manual install bypasses that gate.

**Policy:** Do not run a manual install of `<pkg>@latest` (`pnpm add`, `npm install`, `yarn add`, or a hand-edited `package.json` bump) that pulls in a version published less than 3 days ago without a security sign-off.

- A security sign-off means explicit approval from a maintainer on the security team (security@tina.io).
- Check a version's publish date before installing: `npm view <pkg> time --json`.
- The rule covers forced transitive upgrades and resolution overrides, not just direct dependencies.
- An emergency upgrade (for example, a patch that itself fixes an active vulnerability) is the case for getting the sign-off, not for skipping it.
