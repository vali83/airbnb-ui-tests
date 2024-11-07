# Airbnb UI Automated Tests

This project contains automated UI tests for Airbnb's search functionality using WebdriverIO and TypeScript.

### Prerequisites

- Node.js 
- npm

## Setup

1. Create a directory(folder) for the project., for example `mkdir assessment-valentin-chiorean`
2. Navigate to the project directory: `cd assessment-valentin-chiorean`
3. Run `npm install` to install the dependencies
4. Follow up with `npm audit fix --force` to fix any vulnerabilities
5. npx wdio run wdio.conf.ts --spec test-1.e2e.ts


## Run the tests

1. Run `npx wdio run wdio.conf.ts --spec test-1.e2e.ts` to run the tests
2. Run `npx allure generate --clean` to generate the allure report
3. Run `npx allure open` to open the allure report in your default browser


## Notes

- Test 1: Verify that the results match the search criteria
    - Open www.airbnb.com.
    - Select Rome, Italy as a location.
    - Pick a Check-In date one week after the current date.
    - Pick a Check-Out date one week after the Check-In date.
    - Select the number of guests as 2 adults and 1 child.
    - Search for properties with the selected criteria.
    - Verify that the applied filters are correct in the results page.
    - Verify that the displayed properties match the applied filters (for example properties canaccommodate at least the selected number of guests).

- Test 2: Verify that the results and details page match the extra filters
    - Search for properties that match the same filters as the first test.
    - Open the ‘more/advanced filters’ popup.
    - Select the number of bedrooms as 5.
    - Select Pool from the Facilities section.
    - Apply the new filters.
    - Verify that the properties displayed on the first page have at least the number of selected
    - Open the details of the first property.
    - Check that the ‘Pool’ option is displayed in the ‘Amenities’ popup under the ‘Amenities’ section.

- Test 3: Verify that a property is displayed on the map correctly
    - Search for properties that match the same filters as the first test.
    - Hover over the first property in the results list.
    - Check that the property is displayed on the map and the color of the pin changes (upon hover).
    - After identifying the property on the map, click the property’s pin on the map.
    - Verify that the details shown in the map popup are the same as the ones shown in the search results.
