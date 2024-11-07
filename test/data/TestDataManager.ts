import { TestData } from '../types/test.types';

export class TestDataManager {
    private static testData: TestData = {
        homePageUrl: "https://www.airbnb.com/",
        location: "Rome, Italy",
        bookingDates: {
            checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        },
        guests: {
            numberOfAdults: 2,
            numberOfChildren: 1,
            numberOfInfants: 0,
            numberOfPets: 0
        },
        advancedFilters: {
            amenities: ['Pool'],
            bedrooms: 5
        }
    };

    static getTestData(): TestData {
        return this.testData;
    }

    static getHomePageUrl(): string {
        return this.testData.homePageUrl;
    }

    static getLocation(): string {
        return this.testData.location;
    }

    static getCheckInDate(): Date {
        return this.testData.bookingDates.checkIn;
    }

    static getCheckOutDate(): Date {
        return this.testData.bookingDates.checkOut;
    }

   
    // Add more getters as needed
} 