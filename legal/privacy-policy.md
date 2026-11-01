# Privacy Policy

Last updated: 2026-11-01

This policy explains how your personal data is handled when you use the Shellui Playground at playground.shellui.com. The Playground is a free, open-source demo of Shellui. It is not a commercial service.

It is written to meet the information duties of the EU General Data Protection Regulation (GDPR, Articles 13 and 14) and the Swiss Federal Act on Data Protection (FADP, Article 19).

## 1. Who is responsible

The controller for the processing described here is:

Sébastien Barbier (private individual)
Email: privacy@shellui.com

There is no EU representative and no data protection officer. Neither is required for a project of this size: [TO CONFIRM with a lawyer, GDPR Article 27 exemption for occasional, low-risk processing].

## 2. What data we process and why

### 2.1 Visiting the Playground

The Playground is a static site served by GitHub Pages. When you load it, GitHub receives your IP address, browser details and the requested page, as technical server logs. We do not see or keep these logs.

- Purpose: deliver the site and keep it secure.
- Legal basis: legitimate interest in running a working, secure website (GDPR Art. 6(1)(f)).

### 2.2 Signing in

You can sign in with GitHub, Google or Microsoft, or with a one-time sign-in link sent to your email address (magic link). Sign-in is handled by the Shellui identity service at id.eu.shellui.com. The provider you pick shares with us only what these permissions allow:

- GitHub: your public profile and email address (`read:user`, `user:email`).
- Google: your name, email address and profile picture (`openid`, `email`, `profile`).
- Microsoft: your name, email address and basic profile (`openid`, `email`, `profile`, `User.Read`).

We store your account: email address, name, profile picture link, the provider account ID and the profile data the provider returns. We also store your language preference and the date you were last active.

- Purpose: create and run your Playground account.
- Legal basis: performance of the agreement you accept when you sign in, our Terms of Use (GDPR Art. 6(1)(b)).

You never give us a password. The provider decides what it logs about your sign-in under its own privacy policy.

### 2.3 Sign-in security and audit events

When you sign in or refresh a session, the identity service records an event with your IP address, browser user agent, a random device ID created in your browser, your time zone and the time. These events are deleted automatically after 7 days by a scheduled purge job.

- Purpose: detect abuse, secure accounts and investigate incidents.
- Legal basis: legitimate interest in security (GDPR Art. 6(1)(f)).

### 2.4 Sessions and tokens

After sign-in, your browser receives a short-lived access token (about 5 minutes) and a refresh token (valid up to 7 days). The refresh token is kept in your browser's session storage and is cleared when you close the tab. On our side we keep a record of each session (a token ID, not the token itself, with expiry and revocation) so we can end it.

- Legal basis: performance of the agreement (GDPR Art. 6(1)(b)).

### 2.5 Error reporting (optional)

If you allow it in the cookie notice, the Playground sends error reports to Sentry. A report contains the error, the page, your browser details and your IP address, and may contain your user ID or email if you are signed in. Nothing is sent until you accept, and you can turn it off at any time in Settings.

- Purpose: find and fix bugs.
- Legal basis: your consent (GDPR Art. 6(1)(a)). You can withdraw it at any time, without affecting earlier processing.

The identity service also reports server errors to Sentry. These reports are filtered before sending: query strings, request bodies, the Referer header and secret values are removed, and personal identifiers are not attached by default.

- Legal basis: legitimate interest in a reliable, secure service (GDPR Art. 6(1)(f)).

### 2.6 Emails you send us

If you write to us, the message and your address are received through Fastmail, our mail provider. We use them only to answer you.

- Legal basis: legitimate interest in answering you (GDPR Art. 6(1)(f)), or steps you request (Art. 6(1)(b)).

### 2.7 Sign-in emails we send you

The only emails the Playground sends you are sign-in emails, when you ask for a magic link. They are sent through Resend from no-reply@shellui.com and contain your email address and the one-time link. We send no newsletters or marketing emails.

- Purpose: let you sign in without a password.
- Legal basis: performance of the agreement (GDPR Art. 6(1)(b)).

We do not sell your data, do not use it for advertising, and do not use analytics or tracking tools.

## 3. Data stored in your browser

See section 10 for the full list. In short: the Playground uses your browser's local and session storage for sign-in, settings and your cookie choice, and the identity service sets two strictly necessary cookies during sign-in.

## 4. Who receives your data

We use these service providers. They act as processors on our behalf, except where noted.

| Provider                           | Role                                                                                       | Data                                       | Location            |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------- |
| OVH SAS (OVHcloud)                 | Server hosting for the identity service                                                    | Account, sessions, security events         | France (Gravelines) |
| GitHub, Inc.                       | Hosting of the Playground site                                                             | IP address, technical logs                 | United States       |
| Functional Software, Inc. (Sentry) | Error reporting                                                                            | Error reports, IP address, browser details | United States       |
| Fastmail Pty Ltd                   | Email for messages you send us                                                             | Your email and message                     | Australia           |
| Resend, Inc.                       | Sending sign-in emails (magic links)                                                       | Your email address and the sign-in link    | United States       |
| GitHub, Google, Microsoft          | Sign-in providers you choose. They act as independent controllers under their own policies | Sign-in request and result                 | Their own locations |

We may disclose data to authorities when the law requires it.

## 5. Transfers outside Switzerland and the EU

Some providers above are in the United States or Australia. We protect these transfers as follows:

- United States: where the provider is certified under the EU-US Data Privacy Framework and the Swiss-US Data Privacy Framework, the transfer relies on the adequacy decision of the European Commission and on Switzerland's recognition of the Swiss-US framework (FADP Art. 16(1)). Otherwise it relies on the European Commission's Standard Contractual Clauses, adapted for Swiss law (GDPR Art. 46, FADP Art. 16(2)). [TO CONFIRM: current DPF certification of GitHub, Sentry, Resend and Fastmail on dataprivacyframework.gov, and signed DPAs.]
- Australia: Standard Contractual Clauses in the provider's data processing agreement. [TO CONFIRM]

You can ask us for a copy of the safeguards at the address in section 1.

## 6. How long we keep data

| Data                                         | Retention                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Account                                      | Until you delete your account, or until the Playground is reset or shut down            |
| Sign-in and security events (IP, user agent) | 7 days                                                                                  |
| Session records                              | Until you delete your account. Expired records are not purged automatically yet         |
| Error reports in Sentry                      | The default retention period of our Sentry plan, after which Sentry deletes it          |
| Emails you send us                           | As long as needed to answer, then 12 months                                             |
| Browser storage                              | Session storage: until you close the tab. Local storage: until you sign out or clear it |

The Playground is a demo. We may delete all accounts and data at any time, with or without notice.

## 7. Your rights

Under the GDPR and the FADP you can:

- access the data we hold about you and get a copy;
- correct inaccurate data;
- delete your data. You can delete your account yourself in Settings, or ask us;
- restrict or object to processing based on legitimate interest;
- receive your data in a portable format;
- withdraw consent at any time, for example for error reporting in Settings.

Write to privacy@shellui.com. We answer within 30 days. We may ask you to prove your identity.

## 8. Complaints

You can complain to a supervisory authority:

- Switzerland: Federal Data Protection and Information Commissioner (FDPIC), Feldeggweg 1, 3003 Bern, www.edoeb.admin.ch
- EU: the authority of your country of residence, work or the place of the alleged breach. The list is on edpb.europa.eu.

We would like to hear from you first, so we can try to fix it.

## 9. Automated decisions and profiling

We make no decisions about you based only on automated processing, and we do not profile you.

## 10. Cookies and browser storage

The Playground does not use advertising or analytics cookies.

Strictly necessary, set by id.eu.shellui.com during sign-in:

- `sessionid` (or `__Secure-sessionid`): keeps the sign-in flow together. Host-only, secure.
- `csrftoken` (or `__Secure-csrftoken`): protects forms against cross-site attacks. Host-only, secure, not readable by scripts.

Stored in your browser by the Playground:

| Key                                 | Storage                  | Purpose                                     |
| ----------------------------------- | ------------------------ | ------------------------------------------- |
| `shellui.auth.refresh`              | Session storage          | Keeps you signed in in this tab             |
| `shellui.auth.profile`              | Local storage            | Shows your name and picture                 |
| `shellui.auth.last_used_login`      | Local storage            | Remembers which provider you used last      |
| `shellui_auth_client_device_id`     | Local storage            | Random ID that helps spot unusual sign-ins  |
| `shellui:settings`                  | Local storage            | Your settings, including your cookie choice |
| `shellui:sidebar:*`, `playground.*` | Session or local storage | Layout and demo preferences                 |

Optional, only with your consent:

- Sentry error reporting (sentry.io), up to 1 year. You can change your choice at any time in Settings.

Necessary storage relies on legitimate interest and is exempt from consent under the EU ePrivacy rules. Sentry relies on your consent.

## 11. Security

Data is sent over HTTPS only. Tokens are short-lived and not stored in raw form on the server: sessions are tracked by token ID only, and one-time sign-in links are stored as SHA-256 hashes. Access to the servers is limited to the controller.

If a data breach is likely to put you at risk, we notify the competent authority (EU: within 72 hours, Switzerland: as soon as possible) and inform you when the law requires it.

## 12. Changes

We may update this policy. The date at the top shows the latest version. If a change affects you materially, we tell you in the Playground.
