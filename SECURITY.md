# Security Policy

## Reporting Security Issues

We take the security of `soroban-ops-cookbook` and its constituent reference implementations seriously. If you discover a security vulnerability or bug in any policy contract, listener service, or config generator, please report it responsibly.

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please send an email to security/maintainer contact:
* **Contact:** `abdulmalikojo2@gmail.com`
* **Response Time:** We aim to acknowledge reports within 48 hours and provide a timeline for triage and resolution.

## Scope & Audit Status Disclaimer

> [!IMPORTANT]
> **Audit Status:** The contracts, configuration generators, and event listeners in this repository are open-source reference implementations, patterns, and integration recipes. **They have not undergone a formal third-party security audit.**

Before deploying any policy contracts or listener services to production networks (such as Stellar Mainnet):
1. Perform thorough unit and integration testing tailored to your specific application requirements.
2. Conduct independent security code reviews and/or formal audits.
3. Ensure administrative keys and secrets (`SECRET_SEP10_SIGNING_SEED`, database passwords) are stored securely using secret management services (e.g., Vault, AWS Secrets Manager).

## Vulnerability Disclosure Timeline

- **Acknowledgement:** Within 48 hours of report submission.
- **Assessment & Patching:** High-severity issues will be prioritized for immediate fix and release.
- **Public Disclosure:** Vulnerabilities will be publicly disclosed after a fix has been committed and released.
