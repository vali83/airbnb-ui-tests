import { IListing } from "../models/listing.interface";

export interface TestData {
    homePageUrl: string;
    location: string;
    bookingDates: {
        checkIn: Date;
        checkOut: Date;
    };
    guests: {
        numberOfAdults: number;
        numberOfChildren: number;
        numberOfInfants: number;
        numberOfPets: number;
    };
    advancedFilters?: {
        bedrooms?: number;
        amenities?: string[];
    };
}

export interface SearchTestResult {
    listing: IListing;
    mapPin?: WebdriverIO.Element;
} 