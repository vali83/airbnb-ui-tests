import CalendarObjects from '../pageobjects/homepage/searchfilter/calendar.objects.js';
import LocationObjects from '../pageobjects/homepage/searchfilter/location.objects.js';
import GuestsPageObjects from '../pageobjects/homepage/searchfilter/guests.objects.js';
import ResultsPageObjects from '../pageobjects/homepage/searchresults/results.objects.js';
import { StringParser } from '../utils/string-parser.js';
interface BookingDates {
    checkIn: Date;
    checkOut: Date;
}

const calculateBookingDates = (): BookingDates => {
    const currentDate = new Date();
    const checkIn = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
        checkIn,
        checkOut
    };
};
const testCases = [
    {
        homePageUrl: "https://www.airbnb.com/",
        location: "Rome, Italy",
        bookingDates: calculateBookingDates(),
        guests: {
            numberOfAdults: 2,
            numberOfChildren: 1,
            numberOfInfants: 0,
            numberOfPets: 0
        },

    },
    // Add more test cases here if needed
];

// Helper function to calculate minimum required beds
const calculateMinBeds = (adults: number, children: number): number => {
    const adultBeds = Math.ceil(adults / 2); // 2 adults can share 1 bed
    const childrenBeds = Math.ceil(children / 2); // 2 children can share 1 bed
    return adultBeds + childrenBeds;
};
describe('AirBnb Home Page:', () => {
    testCases.forEach(testData => {
        it('Test 1 Verify that the results match the search criteria', async () => {
            // ARRANGE
            const { location, bookingDates, guests } = testData;
            const totalGuests = guests.numberOfAdults + guests.numberOfChildren;
            const minRequiredBeds = calculateMinBeds(guests.numberOfAdults, guests.numberOfChildren);

            // ACT
            // 1. Setup initial state
            await LocationObjects.open(testData.homePageUrl);
            
            // 2. Set location
            await LocationObjects.setLocation(location);
            
            // 3. Set dates
            await CalendarObjects.selectDate(bookingDates.checkIn);
            await CalendarObjects.selectDate(bookingDates.checkOut);
            
            // 4. Set guests
            await GuestsPageObjects.clickGuestsWhoButton();
            await GuestsPageObjects.setGuestsChildrenInputValue(guests.numberOfChildren);
            await GuestsPageObjects.setGuestsAdultsInputValue(guests.numberOfAdults);
            
            // 5. Perform search
            await GuestsPageObjects.search();
            await ResultsPageObjects.waitForLoadingOverlayToDisappear();
            await ResultsPageObjects.waitForListingsToLoad();

            // ASSERT
            // 1. Verify input values
            await expect(await ResultsPageObjects.getReservationLocationText()).toBe(StringParser.stripLocationFromText(location));
            await expect(await ResultsPageObjects.getReservationDatesText()).toBe(StringParser.formatDateRange(bookingDates.checkIn, bookingDates.checkOut));
            await expect(await ResultsPageObjects.getReservationGuestsText()).toBe(`${totalGuests} guests`);

            // 2. Verify search results
            const listings = await ResultsPageObjects.getListings();
            listings.forEach(listing => {
                // Validate beds/bedrooms requirements
                if (listing.bedrooms === undefined && listing.beds === undefined) {
                    console.warn('Both beds and bedrooms are undefined for listing:', listing.title);
                } else if (listing.bedrooms === undefined) {
                    expect(listing.beds).toBeGreaterThanOrEqual(minRequiredBeds);
                } else if (listing.beds === undefined) {
                    expect(listing.bedrooms).toBeGreaterThanOrEqual(minRequiredBeds);
                } else {
                    expect(listing.beds).toBeGreaterThanOrEqual(minRequiredBeds);
                }
            });
        });
    });
});