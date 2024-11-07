import CalendarObjects from '../pageobjects/homepage/searchfilter/calendar.objects.js';
import LocationObjects from '../pageobjects/homepage/searchfilter/location.objects.js';
import GuestsPageObjects from '../pageobjects/homepage/searchfilter/guests.objects.js';
import AdvancedSearchPageObjects from '../pageobjects/homepage/searchfilter/advancedsearch.objects.js';
import ResultsPageObjects from '../pageobjects/homepage/searchresults/results.objects.js';
import ListingDetailsPageObjects from '../pageobjects/listingdetails.objects.js';
import { StringParser } from '../utils/string-parser.js';
import { IListing } from '../models/listing.interface.js';
import MapPageObjects from '../pageobjects/homepage/searchresults/map.objects.js';
import { ChainablePromiseElement } from 'webdriverio';
import { browser } from '@wdio/globals';
import { BookingDates } from '../models/listing.interface.js';


const calculateBookingDates = (): BookingDates => {
    const currentDate = new Date();
    const checkIn = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
        checkIn,
        checkOut
    };
};

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



// Helper function to calculate minimum required beds
const calculateMinBeds = (adults: number, children: number): number => {
    const adultBeds = Math.ceil(adults / 2); // 2 adults can share 1 bed
    const childrenBeds = Math.ceil(children / 2); // 2 children can share 1 bed
    return adultBeds + childrenBeds;
};


describe('AirBnb Home Page:', () => {
    let listings: IListing[] = [];
    let listingsAdvancedSearch: IListing[] = [];
    let testData;

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
            advancedFilters: {
                amenities: ['Pool'],
                bedrooms: 5,
            }
        },
    ];

    before(async () => {


    });

    testCases.forEach(testData => {
        it('Test 1: Verify that the results match the search criteria', async () => {
            // ARRANGE
            const { location, bookingDates, guests } = testData;
            const totalGuests = guests.numberOfAdults + guests.numberOfChildren;
            const minRequiredBeds = calculateMinBeds(guests.numberOfAdults, guests.numberOfChildren);

            // ACT
            // 1. Setup initial state
            await browser.url(testData.homePageUrl);
            
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
            await AdvancedSearchPageObjects.clickAdvancedFiltersButton();
            await AdvancedSearchPageObjects.waitForFiltersDialogToOpen();
            await AdvancedSearchPageObjects.waitForAdvancedFiltersPopupElements();
            
            // 2. Set bedrooms
    await AdvancedSearchPageObjects.setBedroomsInputValue(testData.advancedFilters.bedrooms);
            
            // 3. Set amenities
            const amenitiesList = await AdvancedSearchPageObjects.getAmenitiesElements();
            console.log("---------------> amenitiesList: ", amenitiesList);
            const amenitiesPresent = testData.advancedFilters.amenities.every(async (amenity) => {
                return await AdvancedSearchPageObjects.isAmenitiesElementPresent(amenity,3000);
            });
            if (!amenitiesPresent) {
                await AdvancedSearchPageObjects.clickShowMoreAmenitiesLink();
                await AdvancedSearchPageObjects.waitForShowMoreAmenitiesLinkToDisappear();
            }
            testData.advancedFilters.amenities.forEach(async (amenity) => {
                await AdvancedSearchPageObjects.clickAmenitiesElement(amenity);
                // await AdvancedSearchPageObjects.waitForAmenityToBeSelected(amenity);
            });
            await AdvancedSearchPageObjects.clickShowPlacesButton();
            await AdvancedSearchPageObjects.waitForFiltersDialogToClose();

            // 4. Perform search
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
                    expect(listing.bedrooms).toBeGreaterThanOrEqual(testData.advancedFilters.bedrooms);
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
         testData.advancedFilters.amenities.forEach(async (amenity) => {
            await ListingDetailsPageObjects.waitForAmenityToLoad(amenity);
         });

         // if amenity is not present, open the show all amenities section
         testData.advancedFilters.amenities.forEach(async (amenity) => {
            if (!(await ListingDetailsPageObjects.isAmenityPresent(amenity))) {
                await ListingDetailsPageObjects.clickShowAllAmenitiesLink();
                await ListingDetailsPageObjects.waitForAmenitiesPopupToLoad();
            }
         });
        
         // check if the selected amenities are  present / clickable
         testData.advancedFilters.amenities.forEach(async (amenity) => {
            await expect(await ListingDetailsPageObjects.isAmenityPresent(amenity)).toBeTruthy();
         });
            

            await browser.closeWindow();
            await browser.switchToWindow(originalHandle);
            
        });

        it('Test 3: Verify that a property is displayed on the map correctly', async () => {
            // ARRANGE
            const { location, bookingDates, guests } = testData;
            const totalGuests = guests.numberOfAdults + guests.numberOfChildren;

            // ACT
            // 1. Setup initial state
            await browser.url(testData.homePageUrl);
            
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
            await expect(await MapPageObjects.checkStyleChangeOnHover(listingElement as unknown as ChainablePromiseElement, mapPinElement as unknown as ChainablePromiseElement)).toBeTruthy();

            await MapPageObjects.clickPartiallyVisiblePin(mapPinElement as unknown as ChainablePromiseElement);
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
