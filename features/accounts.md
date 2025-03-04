# Accounts / Billing / User Settings

- user subscription and prices are kept updated with the webhook.
- user can update payment method, cancel subscription, change billing details, view invoices in the billing portal
- test out isPro subscription context works

- implement banners for:

  - announcements
  - trial ending, payment failed
  - referral code available
  - offer code

- create a firstLogin flag and add a welcome message
- create a list of referral_uses and credits earned
- notification emails:

  - trial ending
  - welcome
  - referral successful

- only apply referral on a new user
- account is signed up for Pro trial by default
- make active account a db feature, not cookies, set lastActive on the user, company and use a firstLogin flag
- user should complete a personal financial goals questionaire as part of onboarding, where they can set their priorities, risk tolerance, describe in writing what they are looking for, why they joined the platform, etc.

- enable Oauth
- implement authjs error handling
- implement user level deletion
- store active account in DB instead of cookie to save a request checking if its active
- make sure that the export zips are secure
- dont create feedback unless the fill out the form, and update with the subscription info
- create a cron job for account deletion and generate a report on the user
- fix too many calls to auth/refreshes
