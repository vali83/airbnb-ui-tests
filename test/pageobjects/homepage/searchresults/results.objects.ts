import Page from '../../page.js';
import { IListing } from '../../../models/listing.interface.js';
import { StringParser } from '../../../utils/string-parser.js';

class ResultsPageObjects extends Page {
    public get resultsContainer(){
        return $("//div[@id='site-content']");
    }

    // listing cards
    public get listingCardsElements() {
        return $$("//div[@id='site-content']//div[@itemprop='itemListElement']");
    }

    public getListingElementByTitle(title: string) {
        return this.listingCardsElements.find(async (listing) => {
            const titleElement : ChainablePromiseElement = await listing.$("//div[starts-with(@id,'title_')]");
            const cardTitle = await this.safeGetText(titleElement);
            return cardTitle === title;
        });
    }

    public async extractListingData(listingCardElement: WebdriverIO.Element): Promise<IListing> {
        const property: IListing = {};
        try {

            const titleElement : ChainablePromiseElement = await listingCardElement.$("//div[starts-with(@id,'title_')]");
            const descriptionElement : ChainablePromiseElement = await listingCardElement.$("//div[starts-with(@id,'title_')]/following-sibling::*[1][name()='div']/span");
            const bedsElement : ChainablePromiseElement = await listingCardElement.$("//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'bed')]");
            const bedroomsElement : ChainablePromiseElement = await listingCardElement.$("//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'bedroom')]");
            const pricePerNightElement : ChainablePromiseElement = await listingCardElement.$("//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'per night')]");

            property.title = await this.safeGetText(titleElement);
            property.description = await this.safeGetText(descriptionElement);
            property.beds = await this.safeGetNumber(bedsElement);
            property.bedrooms = await this.safeGetNumber(bedroomsElement);
            const pricePerNightText = await this.safeGetText(pricePerNightElement);
            if (pricePerNightText) {
                property.pricePerNight = StringParser.extractPrice(pricePerNightText);
            }
        } catch (error) {
            console.error("Error extracting listing data", error);
        }
        return property;
    }

    async waitForListingsToLoad() {
        // Wait for container to be displayed
        await this.resultsContainer.waitForDisplayed({ timeout: 10000 });

        // Wait for loading spinner to disappear (if exists)
        const loadingSpinner = await this.loadingOverlayElement;
        await loadingSpinner.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {});

        // Wait for at least one listing to be present
        await browser.waitUntil(async () => {
            const listings = await this.listingCardsElements.map(async (listing) => await listing);
            return listings.length > 0;
        }, {
            timeout: 10000,
            timeoutMsg: 'Listings did not load after 10 seconds',
            interval: 500
        });
    }

    public async getListings(): Promise<IListing[]> {
        const properties: IListing[] = [];
        const listings = await this.listingCardsElements.map(async (listing) => await listing);

        for (const listing of listings) {
            try {
                // Wait for the card to be properly loaded
               await listing.waitForDisplayed();
                
                // Extract data for this specific card
                const propertyData = await this.extractListingData(listing);
                properties.push(propertyData);
                
                // Only add properties that have at least some data
                // if (Object.keys(propertyData).length > 0) {
                    // properties.push(propertyData);
                // }
            } catch (error) {
                console.error('Error processing property card:', error);
            }
        }

        return properties;
    }

    public get listingTitlesElements() {
        return this.listingCardsElements.map(card => card.$("//div[starts-with(@id,'title_')]"));
    }

    public get listingDescriptionsElements() {
        return this.listingCardsElements.map(card => card.$("//div[starts-with(@id,'title_')]/following-sibling::*[1][name()='div']/span"));
    }

    public async getListingTitlesTexts() {
        const elements = await this.listingTitlesElements;
        const texts = await Promise.all(elements.map(async (listingTitleElement: ChainablePromiseElement) => {
            return await listingTitleElement.getText();
        }));
        return texts;
    }

    public async getListingDescriptionsTexts() {
        const elements = await this.listingDescriptionsElements;
        const texts = await Promise.all(elements.map(async (listingDescriptionElement: ChainablePromiseElement) => {
            return await listingDescriptionElement.getText();
        }));
        return texts;
    }

    public get listingBedsElements() {
        return this.listingCardsElements.map(card => card.$("//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'bed')]"));
    }

    public get listingBedroomsElements() {
        return this.listingCardsElements.map(card => card.$("//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'bedroom')]"));
    }
    // loading overlay

    public get loadingOverlayElement() {
        return $("//div[@aria-label='Loading']");
    }

    public get mapLoadingElement() {
        return $("//div[@aria-label='Loading']");
    }


    public async waitForLoadingOverlayToDisappear() {

        await this.loadingOverlayElement.waitForDisplayed({timeout: 1000, timeoutMsg: "Loading overlay not displayed"});
        await this.loadingOverlayElement.waitForExist({timeout: 10000, reverse: true, timeoutMsg: "Loading overlay still exists"});
    }

    public get reservationDatesElement() {
        return $("//button//span[contains(text(),'Check in / Check out')]/following-sibling::div");
    }

    public async getReservationDatesText() {
        const element = await this.reservationDatesElement;
        return await element.getText();
    }

    public get reservationLocationElement() {
        return $("//button//span[contains(text(),'Location')]/following-sibling::div");
    }

    public async getReservationLocationText() {
        const element = await this.reservationLocationElement;
        return await element.getText();
    }

    public get reservationGuestsElement() {
        return $("//button//span[contains(text(),'Guests')]/following-sibling::div[1]");
    }

    public async getReservationGuestsText() {
        const element = await this.reservationGuestsElement;
        return await element.getText();
    }

    public async clickListingCard(title: string) {
        const listingCard : ChainablePromiseElement = await this.listingCardsElements.find(async (card) => {
            const titleElement : ChainablePromiseElement = await card.$("//div[starts-with(@id,'title_')]");
            const cardTitle = await this.safeGetText(titleElement);
            return cardTitle === title;
        });
        await listingCard.click();
    }
}

export default new ResultsPageObjects();