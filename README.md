# Github users by country
A simple script that uses the giuthub API to get a list of github users by country. It returns an array with the users and their following fields:
- username (login)
- name
- company
- location
- email
- public_repos
- created_at

optionally you can also save a csv file with the output data if you provide a second argument true

# installation
`git clone repo`

# usage 
1. `cd gh_users_by_country`
2. create a file called .env and add the following lines: `GH_TOKEN=your_gh_token`
2. run `node test/getGhUsers.js COUNTRY START_PAGE`

# Commands
1. **getGhUsers:** returns an array of user objects with the fields listed above. Will only return a maximum of 20 pages (600 results) to comply with gh API quota limits.
`node test/getGhUsers.js COUNTRY START_PAGE`
2. **saveCsv:** converts the users.json file into a csv and saves it as users.csv
`node test/sendMassMail.js`
3. **sendMassMail:** uses AWS SES to send a mass templated email to all the users with an email address. Your email address must have been confirmed with AWS SES.
`node test/sendMassMail.js EMAIL`
4. **followTwitterUsers:** follows users in twitter if their twitter handle coincides with their github username
`node test/followTwitterUsers.js START LIMIT`