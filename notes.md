# TODO

## Accounts / Billing / User Settings

- all accounts should become immediate customers with free trial
- billing should be at account level - each account pays separately.
- add paid feature flags
- create account -> onboarding
- delete account
- confirm payment flow works
- enable Oauth
- implement authjs error handling
- user should complete a personal financial goals questionaire as part of onboarding, where they can set their priorities, risk tolerance, describe in writing what they are looking for, why they joined the platform, etc.

## Mortgage Calculator

- mortgage calculator should show beautiful graphs
- mortgage calculator should work for any province
- mortgage calculator should load location as default from account_preferences.
- mortgage calculator should have hover cards for all the numbers describing how they are calculated, what they mean.
- mortgage calculator should have a graph showing the prime interest rate over time and the latest news
- should show data from https://api.ratehub.ca/mortgage-rates/best/purchase-rates?amortization=25&city=Toronto&downPaymentPercent=0.05&homePrice=400000&isCashBack=0&isFeatured=1&isOpen=0&isOwnerOccupied=1&isPreApproval=0&language=en&province=ON&scenario=purchase&term[]=12&term[]=24&term[]=36&term[]=48&term[]=60&term[]=72&term[]=84&term[]=96&term[]=108&term[]=120&term[]=300&type[]=fixed&type[]=variable
- should include a guide like ratehub

## Land Transfer Tax Calculator

- same as mortgage calculator

## CMHC Insurance Calulator

- same as Land Transfer Tax calculator

## Utilities Estimator

## POIs

- users should be able to add/remove POIs and mark them with any label
- users should be able to search for POIs in a category, for example grocery stores, and add them as well.
- users should be able to import their POIs from Google Maps
- default location should be users home or geo location
- users should be able to see a POI score for every property based on the distance from their home and the mode of transport.
- users should be able to filter their POIs by category, importance, etc.

## Properties

- users should be able to download the extension, sign in with their account, add properties.
- properties should display bedrooms/bathrooms
- properties should be viewable on an a map
- add custom property feature detection (pro feature)
- add price comparison to other homes in community
- fix renovation selection

## Renovations

- can generate renovations
- can optimize POI
- can add/delete renovations
- can add to reno list
- can generate indepth bill of materials
- can upload receipts
- can get a list of contractors
- can auto send emails for quotes
- can upload pictures for a job
- can put together package to apply to greener home grant
- can visualize savings estimates for home efficiency renos

## Home

- can add your own home
- can upload bills
- can connect with Nest/Smart home monitors
- can track the current value of your home

## Investments

- brokers comparison

## Credit Cards

- list of all cards available

## Banks

- comparison of saving and chequing accounts, list of all the banks

## Insurance

## Groceries

## Utilities

## DIY

## Lawyers

## Home Services

## Advanced features

- an AI search engine connected to all the documentation imaginable related to finance, accounting, real estate and investing

- SQL and API access to your data. SDK for developers to build on top of the platform.

## Improve accuracy

- go line by line and write tests for all the code
- check the growth numbers reported by house sigma against the nearby house data
- look through all HouseSigma data for other valuable data
- utilities estimate
- upkeep estimate - use age of home, square ft, photos
- tax estimate
- get multiple accurate quotes for lawyer, inspector, appraisal, title insurance, realtor percentage

## Rental

- support for STR, including zoning, fees, write offs, capital gains, etc
- improve accuracy of rental prices and vacancy rates
- add rennovation to rent cost
- add second suite financing
- add school bus support

The average difference in net worth from rent vs buy tells us the most likely outcome, since we cannot predict the parameters

1. max vibe score
2. max average net worth in 5 years
3. max underpriced - neighbouring house prices adjusted per sqft, land size, rooms, age, condition, location (schools, distance to POI) vs house asking price
4. max cashflow in 5 years
5. rentable

## Support, Docs and Marketing

- validate blog writer AI works
- a help page which describes all the way in which to get help
- a support email to receive general questions
- in depth analytics, error monitoring, metrics and alerts, with sentry

- add metadata for SEO, generate thumbnails, blog images, analytics, google search indexing
- create social media accounts & add to menu links

- free trial expiry banner with upgrade to pro / dismiss popping up daily. Dialog when trial ends to upgrade to pro or stay as is
- prompts to upgrade to pro or sign up at each feature level

- a report an issue feature where the user can click a button and describe an issue with relevant context

- a roadmap where you can see what is planned for the App with voting, connected to a discussion forum where users can suggest features and vote on them

- a blog with human written articles including product updates and finance stuff.
- a newsletter with articles going out on a monthly basis and prompts to sign up for the newsletter in various places

- an AI support agent with a knowledge base of issues experienced so far, connected to the issues reported and monitoring the service

- a documentation section for product docs, tutorials, etc
- Hover cards with animations showing how a feature works (also in the docs)

- an exclusive pro community to discuss financial tips, news, etc.

- AI generated content to post on social media, twitter and reddit bots.
