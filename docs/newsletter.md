# Monthly newsletter setup

The small newsletter section is prepared in `src/components/NewsletterSignup.jsx`.
It appears in the local development preview, with a disabled signup button.
It is omitted from production HTML and the live UI until a real public signup URL
is set in `src/data/newsletter.js`. Never put API keys or subscriber lists there.

## Recommended first version

Keep the site on GitHub Pages and use MailerLite as the subscriber and sending
backend. The site button opens a hosted signup form. No custom server, database,
email API key, or third-party tracking script is needed on the site for this flow.

1. The owner creates a MailerLite account and completes its account approval.
2. Create a group called “You Belong — Monthly Newsletter”.
3. Create a signup form for that group, asking only for email (first name optional).
   Clearly describe the monthly community newsletter and enable double opt-in:
   subscribers must confirm their email before joining the active mailing list.
   Use the provider's spam protection and include a privacy explanation covering
   who receives the address and how it is used.
4. Copy the form's public **Share URL** into `newsletterSignupUrl`.
5. Configure `info@youbelongsandiego.org` as the sender and authenticate the domain
   with the records shown in the account. Review existing GoDaddy DNS records;
   preserve website/mail records and merge SPF with any existing SPF record.
6. Build and test the real signup link with the owner's test address: confirmation,
   active-list membership, welcome/confirmation wording, and unsubscribe. A
   form submission alone is not proof of a confirmed subscription.
7. Publish the working signup section after review. Create each monthly issue as
   a draft and let the owner review and schedule it in MailerLite. Do not turn
   event discovery or event-request submissions into automatic newsletter sends.

## Current status

- Original cream background and dark green branding restored.
- Newsletter section prepared; public signup URL not configured.
- No provider account, domain authentication, subscriber collection, or sending
  automation has been configured. Nothing has been published for this change.

Provider references:
- [Signup forms and public Share URLs](https://www.mailerlite.com/help/how-to-create-an-embedded-form)
- [Double opt-in](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers)
- [Domain authentication](https://www.mailerlite.com/help/how-to-verify-and-authenticate-your-domain)
- [Current pricing and limits](https://www.mailerlite.com/pricing)
