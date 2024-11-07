import { TestData } from "../types/test.types";
import LocationObjects from "../pageobjects/homepage/searchfilter/location.objects";
import CalendarObjects from "../pageobjects/homepage/searchfilter/calendar.objects";
import GuestsPageObjects from "../pageobjects/homepage/searchfilter/guests.objects";
import AdvancedSearchPageObjects from "../pageobjects/homepage/searchfilter/advancedsearch.objects";

export const setupSearch = async (testData: TestData) => {
    await LocationObjects.open('https://www.airbnb.com/');
    await LocationObjects.setLocation(testData.location);
    await CalendarObjects.selectDate(testData.bookingDates.checkIn);
    await CalendarObjects.selectDate(testData.bookingDates.checkOut);
    await GuestsPageObjects.setGuests(testData.guests.numberOfAdults, testData.guests.numberOfChildren);
};

export const applyFilters = async (advancedFilters: TestData['advancedFilters']) => {
    if (!advancedFilters) return;
    await AdvancedSearchPageObjects.clickAdvancedFiltersButton();
    await AdvancedSearchPageObjects.waitForFiltersDialogToOpen();
    if (advancedFilters.bedrooms) {
        await AdvancedSearchPageObjects.setBedroomsInputValue(advancedFilters.bedrooms);
    }
    // ... other filter logic
}; 