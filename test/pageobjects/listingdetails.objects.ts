
import Page from "./page.ts";


export class ListingDetailsPageObjects extends Page {
    
    public get titleElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='TITLE_DEFAULT']//h1");
    }

    public async getTitle() {
        return await this.titleElement.getText();
    }

    public get listingTopAreaBusyElements() {
        return $$("//*[@aria-busy='true']");
    }

    public get overviewSectionElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='OVERVIEW_DEFAULT_V2']//h2");
    }

    public get overviewSectionGuestsElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='OVERVIEW_DEFAULT_V2']//h2/ancestor::div//li[contains(.,'guests')]");
    }

    public get overviewSectionBedsElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='OVERVIEW_DEFAULT_V2']//h2/ancestor::div//li[contains(.,'bed')]");
    }

    public get overviewSectionBedroomsElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='OVERVIEW_DEFAULT_V2']//h2/ancestor::div//li[contains(.,'bedroom')]");
    }

    public async getOverviewSectionBedrooms() : Promise<number> {
        return parseInt(await this.overviewSectionBedroomsElement.getText().then((text: string) => text.replace(/\D/g, '')));
    }

    public get amenitiesSectionTitleElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='AMENITIES_DEFAULT']");
    }

    public get amenitiesSectionElements() {
        return $$("//div[@data-section-id='AMENITIES_DEFAULT']//section/div/div[not(.//text()[contains(.,'What this place offers')])]");
    }
 
    /**
     * Get the amenities section element for a given amenity
     * @param amenity - The amenity to get the section element for
     * @returns The amenities section element
     */
    public getAmenitiesSectionElement(amenity: string) : ChainablePromiseElement {
        return $(`//div[@data-section-id='AMENITIES_DEFAULT']//section/div/div[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'${amenity.toLowerCase()}')]`);
    }

    public async waitForAmenityToLoad(amenity: string) {
        const amenitiesSectionElement = await this.getAmenitiesSectionElement(amenity);
        await amenitiesSectionElement.waitForDisplayed({ timeout: 3000 });
    }


    public async selectAmenities(amenities: string[]){
        await Promise.all(amenities.map(async (amenity) => await this.waitForAmenityToLoad(amenity)));
    }

    public async isAmenityPresent(amenity: string) : Promise<boolean> {
        const amenitiesSectionElement = await this.getAmenitiesSectionElement(amenity);
        return await amenitiesSectionElement.isDisplayed();
    }
    
    public get amenitiesSectionShowAllElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='AMENITIES_DEFAULT']//section//button[contains(.,'Show all') and contains(.,'amenities')]");
    }

    public async clickShowAllAmenitiesLink() {
        await this.amenitiesSectionShowAllElement.waitForClickable();
        await this.amenitiesSectionShowAllElement.click();
    }

    public get amenitiesPopupLoaderElement() : ChainablePromiseElement {
        return $("//div[@data-section-id='AMENITIES_DEFAULT']//section//button[contains(.,'Show all') and contains(.,'amenities')]");
    }

    public get amenitiesPopupElements() {
        return $$("//div[@role='dialog'][@aria-label='What this place offers']//li");
    }

    public async getAmenitiesPopupElement(amenity: string) : Promise<ChainablePromiseElement>    {
        const amenitiesList = await this.amenitiesPopupElements;
        return amenitiesList.find(async (element) => await element.getText().then((text: string) => text.includes(amenity)));
    }

    /**
     * Wait for the listing top area busy elements to disappear
     * Method called when the page is loaded to wait for the loaders
     * @returns {Promise<void>}
     */
    public async waitForListingTopAreaBusyToDisappear() {
        // get the list of all the busy elements
        const busyElements = await this.listingTopAreaBusyElements;
        // wait for all the busy elements to disappear
        for await (const busyElement of await busyElements) {
            await busyElement.waitForDisplayed({ timeout: 10000, timeoutMsg: "Listing top area busy elements not displayed" });
        }
    }

    public async waitForPageLoad() {
        await this.waitForListingTopAreaBusyToDisappear();
    }

    public get listignDetailsTranslationModal() : ChainablePromiseElement {
        return $("//div[@aria-label='Translation on']");
    }

    public async isTranslationModalOpen() : Promise<boolean> {
        const listingDetailsTranslationModal = await this.listignDetailsTranslationModal;
        await listingDetailsTranslationModal.waitForDisplayed({ timeout: 3000 });
        return await listingDetailsTranslationModal.isDisplayed();
    }
    public async waitForTranslationModalToClose() {
        await this.listignDetailsTranslationModal.waitForDisplayed({ timeout: 7000, reverse: true });
    }
    public get translationModalCloseButton() : ChainablePromiseElement {
        return $("//div[@aria-label='Translation on']//button[@aria-label='Close']");
    }
    public async clickTranslationModalCloseButton() {
        await this.translationModalCloseButton.waitForClickable();
        await this.translationModalCloseButton.click();
    }

    public get amenitiesPopup() : ChainablePromiseElement {
        return $("//div[@role='dialog'][contains(@aria-label,'What this place offers')]");
    }

    async waitForAmenitiesPopupToLoad() {
        const popup = await this.amenitiesPopup;
        const elements  = await popup.$$('*'); 
        
        // Wait for all interactive elements
        await browser.waitUntil(async () => {
            const allDisplayed = await elements.map(async (el: ChainablePromiseElement) => await el.isClickable())
            return allDisplayed.every((displayed: boolean) => displayed === true);
        }, {
            timeout: 10000,
            timeoutMsg: 'Popup elements not fully loaded after 10s'
        });
    }
}

export default new ListingDetailsPageObjects();