import CalendarObjects from '../pageobjects/homepage/searchfilter/calendar.objects.js';
import LocationObjects from '../pageobjects/homepage/searchfilter/location.objects.js';
import GuestsPageObjects from '../pageobjects/homepage/searchfilter/guests.objects.js';
import AdvancedSearchPageObjects from '../pageobjects/homepage/searchfilter/advancedsearch.objects.js';
import ResultsPageObjects from '../pageobjects/homepage/searchresults/results.objects.js';
import ListingDetailsPageObjects from '../pageobjects/listingdetails.objects.js';
import { StringParser } from '../utils/string-parser.js';
import { IListing } from '../models/listing.interface.js';
import MapPageObjects from '../pageobjects/homepage/searchresults/map.objects.js';
import { TestDataManager } from '../data/TestDataManager.js';



async function switchToNewTab(originalHandle: string) {
    await browser.waitUntil(async () => {
        const handles = await browser.getWindowHandles();
        return handles.length > 1;
    }, {
        timeout: 10000,
        timeoutMsg: 'New tab did not open in time'
    });
    
    const handles = await browser.getWindowHandles();
    const newHandle = handles.find(handle => handle !== originalHandle);
    if (newHandle) {
        await browser.switchToWindow(newHandle);
    }
}

const testCases = [
    TestDataManager.getTestData(),
    // Add more test cases here if needed
];

// Helper function to calculate minimum required beds
const calculateMinBeds = (adults: number, children: number): number => {
    const adultBeds = Math.ceil(adults / 2); // 2 adults can share 1 bed
    const childrenBeds = Math.ceil(children / 2); // 2 children can share 1 bed
    return adultBeds + childrenBeds;
};

let listings: IListing[] = [];
let listingsAdvancedSearch: IListing[] = [];
describe('AirBnb Home Page:', () => {
    testCases.forEach(testData => {
        it('Test 1: Verify that the results match the search criteria', async () => {
            // ARRANGE
            const { location, bookingDates, guests } = testData;
            const totalGuests = guests.numberOfAdults + guests.numberOfChildren;
            const minRequiredBeds = calculateMinBeds(guests.numberOfAdults, guests.numberOfChildren);

            // ACT
            // 1. Setup initial state
            await LocationObjects.openHomePage();
            
            // 2. Set location
            await LocationObjects.setLocationFromTestData();
            
            // 3. Set dates
            await CalendarObjects.setCheckinDateFromTestData();
            await CalendarObjects.setCheckoutDateFromTestData();
            
            // 4. Set guests
            await GuestsPageObjects.setGuestsFromTestData();
            
            // 5. Perform search
            await GuestsPageObjects.search();
            // await ResultsPageObjects.waitForLoadingOverlayToDisappear();
            await ResultsPageObjects.waitForListingsToLoad();

            // ASSERT
            // 1. Verify input values
            await expect(await ResultsPageObjects.getReservationLocationText()).toBe(StringParser.stripLocationFromText(location));
            await expect(await ResultsPageObjects.getReservationDatesText()).toBe(StringParser.formatDateRange(bookingDates.checkIn, bookingDates.checkOut));
            await expect(await ResultsPageObjects.getReservationGuestsText()).toBe(`${totalGuests} guests`);

            // 2. Verify search results
            listings = await ResultsPageObjects.getListings();
            console.log("---------------> listings: ", listings);
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

        it('Test 2: Verify that the results and details page match the extra filters', async () => {
            // ARRANGE

            // ACT
            // 1. Open advanced filters
            await AdvancedSearchPageObjects.openAdvancedFiltersPopup();
            
            // 2. Set bedrooms
            await AdvancedSearchPageObjects.setBedroomsFromTestData();
            
            // 3. Set amenities
            // await AdvancedSearchPageObjects.setAmenitiesFromTestData();
            const amenitiesList = await AdvancedSearchPageObjects.getAmenitiesElements();
            console.log("---------------> amenitiesList: ", amenitiesList);
            const amenitiesPresent = testData?.advancedFilters?.amenities?.every(async (amenity) => {
                return await AdvancedSearchPageObjects.isAmenitiesElementPresent(amenity,3000);
            });
            if (!amenitiesPresent) {
                await AdvancedSearchPageObjects.clickShowMoreAmenitiesLink();
                await AdvancedSearchPageObjects.waitForShowMoreAmenitiesLinkToDisappear();
            }
            if (testData?.advancedFilters?.amenities) {
                for (const amenity of testData.advancedFilters.amenities) {
                    await AdvancedSearchPageObjects.clickAmenitiesElement(amenity);
                    // await AdvancedSearchPageObjects.waitForAmenityToBeSelected(amenity);
                }
            }

             // 4. Perform search
            await AdvancedSearchPageObjects.clickShowPlacesButton();
            await AdvancedSearchPageObjects.waitForFiltersDialogToClose();
            // await ResultsPageObjects.waitForLoadingOverlayToDisappear();
            await ResultsPageObjects.waitForListingsToLoad();

            // ASSERT
            listingsAdvancedSearch = await ResultsPageObjects.getListings();
            console.log("---------------> listingsAdvancedSearch: ", listingsAdvancedSearch);

            // Verify that the properties displayed on the first page have at least the number of selected bedrooms.
            listingsAdvancedSearch.forEach(listing => {
                // Validate beds/bedrooms requirements
                if (listing.bedrooms === undefined ) {
                    console.warn('Bedrooms are undefined for listing:', listing.title);
                } else {
                    if (testData.advancedFilters && testData.advancedFilters.bedrooms !== undefined) {
                        expect(listing.bedrooms).toBeGreaterThanOrEqual(testData.advancedFilters.bedrooms);
                    } else {
                        console.error('testData.advancedFilters.bedrooms is undefined');
                    }
                }
            });

            const targetListing : IListing = listingsAdvancedSearch[0];

            await ResultsPageObjects.clickListingCard(targetListing.title!);
            await browser.pause(3000);
            
            const originalHandle = await browser.getWindowHandle();
            
            await switchToNewTab(originalHandle);

            // wait for page to load
            await ListingDetailsPageObjects.waitForPageLoad();

            // close translation modal if it is open
            if (await ListingDetailsPageObjects.isTranslationModalOpen()) {
                await ListingDetailsPageObjects.clickTranslationModalCloseButton();
                await ListingDetailsPageObjects.waitForTranslationModalToClose();
            }

         // wait for amenities to load
        //  await ListingDetailsPageObjects.waitForAmenitiesToLoad();
        if (testData.advancedFilters && testData.advancedFilters.amenities) {
            for (const amenity of testData.advancedFilters.amenities) {
                await ListingDetailsPageObjects.waitForAmenityToLoad(amenity);
            }
        }


         // if amenity is not present, open the show all amenities section
        //  await ListingDetailsPageObjects.selectAmenitiesFromTestData();
         // check if the selected amenities are present / clickable
         if (testData.advancedFilters?.amenities) {
            for (const amenity of testData.advancedFilters.amenities) {
               await expect(await ListingDetailsPageObjects.isAmenityPresent(amenity)).toBeTruthy();
            }
         }
        // await expect(await ListingDetailsPageObjects.checkAmenitiesFromTestDataSelected()).toBeTruthy();    
                  
        // check if the selected amenities are present / clickable
        if (testData.advancedFilters?.amenities) {
        for (const amenity of testData.advancedFilters.amenities) {
            await expect(await ListingDetailsPageObjects.isAmenityPresent(amenity)).toBeTruthy();
        }
        } else {
            console.error('testData.advancedFilters.amenities is undefined');
        }


            await browser.closeWindow();
            await browser.switchToWindow(originalHandle);
            
        });

        it('Test 3: Verify that a property is displayed on the map correctly', async () => {
            // ARRANGE
            const { location, bookingDates, guests } = testData;
            const totalGuests = guests.numberOfAdults + guests.numberOfChildren;

            // ACT
            // 1. Setup initial state
            await LocationObjects.openHomePage();
            
            // 2. Set location
            await LocationObjects.setLocationFromTestData();
            
            // 3. Set dates
            await CalendarObjects.setCheckinDateFromTestData();
            await CalendarObjects.setCheckoutDateFromTestData();
            
            // 4. Set guests
            await GuestsPageObjects.setGuestsFromTestData();
            
            // 5. Perform search
            await GuestsPageObjects.search();
            // await ResultsPageObjects.waitForLoadingOverlayToDisappear();
            await ResultsPageObjects.waitForListingsToLoad();

            // ASSERT
            // 1. Verify input values
            await expect(await ResultsPageObjects.getReservationLocationText()).toBe(StringParser.stripLocationFromText(location));
            await expect(await ResultsPageObjects.getReservationDatesText()).toBe(StringParser.formatDateRange(bookingDates.checkIn, bookingDates.checkOut));
            await expect(await ResultsPageObjects.getReservationGuestsText()).toBe(`${totalGuests} guests`);

            // 2. Verify search results
            listings = await ResultsPageObjects.getListings();  
            console.log("---------------> listings: ", listings);

            const targetListing : IListing = listings[0];
            const mapPinElement = await MapPageObjects.getMapPinElementByListingTextAndPrice(targetListing.title!, targetListing.pricePerNight!);
            const listingElement = await ResultsPageObjects.getListingElementByTitle(targetListing.title!);
            await expect(await MapPageObjects.checkStyleChangeOnHover(listingElement, mapPinElement)).toBeTruthy();

            await MapPageObjects.clickPartiallyVisiblePin(mapPinElement);
            await MapPageObjects.waitForMapPinElementTitleToLoad(targetListing.title!, targetListing.pricePerNight!);

            const listingDetails = await MapPageObjects.extractListingData();
            console.log("---------------> listingDetails: ", listingDetails);

            await expect(listingDetails.title).toBe(targetListing.title);
            await expect(listingDetails.pricePerNight).toBe(targetListing.pricePerNight);
            await expect(listingDetails.beds).toBe(targetListing.beds);
            await expect(listingDetails.bedrooms).toBe(targetListing.bedrooms);
            await expect(listingDetails.pricePerNight).toBe(targetListing.pricePerNight);

        });
    });
});
