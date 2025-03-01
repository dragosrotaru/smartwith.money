# Accounts / Billing / User Settings

- all accounts should become immediate customers with free trial
- billing should be at account level - each account pays separately.
- add paid feature flags
- confirm payment flow works
- user should complete a personal financial goals questionaire as part of onboarding, where they can set their priorities, risk tolerance, describe in writing what they are looking for, why they joined the platform, etc.

- enable Oauth
- implement authjs error handling
- implement user level deletion
- store active account in DB instead of cookie to save a request checking if its active
- make sure that the export zips are secure
- dont create feedback unless the fill out the form, and update with the subscription info
- create a cron job for account deletion and generate a report on the user
- fix too many calls to auth/refreshes
