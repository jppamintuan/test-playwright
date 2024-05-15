# Playwright + Cucumber (BDD) using TS
## Get Started

### Setup:

Alex's Request
1. Clone or download the project
2. Extract and open in the VS-Code
3. `npm install` to install the dependencies
4. `npx playwright install` to install the browsers
5. `npm test` to execute the tests, 
6. Use tags i.e. TAGS or SCHEME to run a specific or collection of specs
```
TEST_ENV=uat npm run test --TAGS="@test or @add"
```
You can also pass HEADLESS=false to see the browser execute the tests
```
TEST_ENV=sit HEADLESS=false npm test --scheme="QLD"
```
7. To run a particular test, change
```
  paths: [
            "src/test/features/featurename.feature"
         ] 
```

## Features

1. Reports with screenshots, videos & logs (Upcoming . . .)
2. Execute tests on multiple environments 
3. Parallel execution
4. Rerun only failed features
5. Retry failed tests on CI (Upcoming . . .)
6. Github Actions integrated with downloadable report (Upcoming . . .)
7. Page object model
8. Added BM Onboarding API capability (CreateSupllier.ts)

## Sample report

## Project structure

- .github -> yml file to execute the tests in GitHub Actions (Upcoming . . .)
- src -> Contains all the features & Typescript code
- test-results -> Contains all the reports related file

## Reports

1. Mutilple Cucumber Report (Upcoming . . .)
2. Default Cucumber report
3. [Logs](https://www.npmjs.com/package/winston)
4. Screenshots of failure (Upcoming . . .)
5. Test videos of failure (Upcoming . . .)
6. Trace of failure (Upcoming . . .)

### Folder structure
0. `src\pages` -> All the page (UI screen)
1. `src\test\features` -> write your features here
2. `src\test\steps` -> Your step definitions goes here
3. `src\utils\hooks\hooks.ts` -> Browser setup and teardown logic
4. `src\utils\hooks\fixture.ts` -> Simple way to share the page objects to steps
5. `src\utils\environment` -> Multiple environments are handled
6. `src\utils\types` -> To get environment code suggestions
7. `src\utils\report` -> To generate the report (Upcoming . . .)
8. `config\cucumber.js` -> One file to do all the magic
9. `package.json` -> Contains all the dependencies
10. `automation-shared-library/dist/mailinator/MailinatorAPI` -> repo to use the MailinatorAPI
