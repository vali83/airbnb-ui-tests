import Page from '../../page.js';

class AdvancedSearchPageObjects extends Page {
    public get advancedFiltersButton(){
        return $("//button[contains(.,'Filters')]");
    }

    public async waitForAdvancedFiltersPopupElements(timeout : number = 8000) {

        await browser.waitUntil(async () => {
            const bedroomsIncreaseButton = await this.bedroomsIncreaseButton.isClickable();
            const bedroomsDecreaseButton = await this.bedroomsDecreaseButton.isClickable();
            const showMoreAmenitiesLink = await this.showMoreAmenitiesLink.isClickable();

            const allClickable = [bedroomsIncreaseButton, bedroomsDecreaseButton, showMoreAmenitiesLink];
            return allClickable.every((clickable: boolean) => clickable === true);
        }, { timeout, timeoutMsg: 'Popup elements not fully loaded after 10s' });

    }

    /**
     * Wait for the popup to load
     */
    async waitForPopupToLoad() {
        const popup = await this.filtersDialog;
        const elements = await popup.$$('*'); 
        
        // Wait for all interactive elements
        await browser.waitUntil(async () => {
            const allDisplayed = await elements.map(async (el) => await el.isClickable());
            return allDisplayed.every((displayed: boolean) => displayed === true);
        }, {
            timeout: 10000,
            timeoutMsg: 'Popup elements not fully loaded after 10s'
        });
    }

    public async clickAdvancedFiltersButton(){
        await this.advancedFiltersButton.waitForDisplayed();
        await this.advancedFiltersButton.click();
    }

    public get filtersDialog(){
        return $("//div[@role='dialog'][@aria-label='Filters']");
    }

    public async waitForFiltersDialogToOpen(){
        await this.filtersDialog.waitForDisplayed();
    }

    public get bedroomsFilterElement(){
        return $("div#stepper-filter-item-min_bedrooms");
    }

    public get bedroomsDecreaseButton(){
        return $("div#stepper-filter-item-min_bedrooms button[aria-label='decrease value'] span");
    }

    public get bedroomsIncreaseButton(){
        return $("div#stepper-filter-item-min_bedrooms button[aria-label='increase value'] span");
    }

    public get bedroomsInput(){
        return $("div#stepper-filter-item-min_bedrooms button[aria-label='decrease value'] + div");
    }

    public async getBedroomsInputValue(){
        return await this.bedroomsInput.getText();
    }

    public async setBedroomsInputValue(value: number){
        await this.bedroomsIncreaseButton.waitForDisplayed();
        let currentValue = await this.getBedroomsInputValue();
        let currentIntValue = parseInt(currentValue.replace('+', ''));


        // Increase while current is less than target
        while ( (currentValue.includes('Any')) || (!currentValue.includes('Any') && currentIntValue < value)) {
            await this.bedroomsIncreaseButton.waitForDisplayed();
            await this.bedroomsIncreaseButton.scrollIntoView();
            await this.bedroomsIncreaseButton.moveTo({ xOffset: 3, yOffset: 3 });
            await this.bedroomsIncreaseButton.click();
            currentValue = await this.getBedroomsInputValue();
            currentIntValue = parseInt(currentValue.replace('+', ''));
        }

        // Decrease if current is greater than target
        while (currentIntValue > value) {
            await this.bedroomsDecreaseButton.waitForDisplayed();
            await this.bedroomsDecreaseButton.scrollIntoView();
            await this.bedroomsDecreaseButton.moveTo({ xOffset: 3, yOffset: 3 });
            await this.bedroomsDecreaseButton.click();
            currentValue = await this.getBedroomsInputValue();
            currentIntValue = parseInt(currentValue.replace('+', ''));
        }
    }

    public get showMoreAmenitiesLink(){
        return $("//span[contains(.,'Show more')]");
    }
    public async clickShowMoreAmenitiesLink(){
        await this.showMoreAmenitiesLink.waitForDisplayed();
        await this.showMoreAmenitiesLink.click();
    }

    public async waitForShowMoreAmenitiesLinkToDisappear(){
        await this.showMoreAmenitiesLink.waitForDisplayed({ timeout: 3000, reverse: true });
    }

    public get amenitiesElements() {
        // return $$("//section[@aria-labelledby='filter-section-heading-id-FILTER_SECTION_CONTAINER:MORE_FILTERS_AMENITIES_WITH_SUBCATEGORIES']//button[starts-with(@id,'filter-item-amenities-')]");
        return $$("//button[starts-with(@id,'filter-item-amenities-')]");
    }
    public async getAmenitiesElements() {
        return await this.amenitiesElements;
    }

    /**
     * Wait for the amenity to be selected
     * @param amenityName - The name of the amenity to wait for
     */
    public async waitForAmenityToBeSelected(amenityName: string){
        const xpath = `[@aria-pressed='true'][contains(.,'${amenityName}')]`;
        const element = await this.amenitiesElements.map(element => element.$(xpath)) as unknown as ChainablePromiseElement;
        await element.waitForClickable({ timeout: 3000 });
    }

    public get showPlacesButtonLoading() {
        return $("//button[contains(.,'Clear all')]/following-sibling::div//a/span/span");
    }

    public get showPlacesButton() {
        return $("//button[contains(.,'Clear all')]/following-sibling::div//a");
    }

    public async clickShowPlacesButton(){
        // wait for the loading to disappear
        await this.showPlacesButtonLoading.waitForDisplayed({ timeout: 7000, reverse: true });
        await this.showPlacesButton.waitForDisplayed();
        await this.showPlacesButton.click();
    }

    public async amenitiesElement(amenityName: string) {
        // const xpathBase = "//section[@aria-labelledby='filter-section-heading-id-FILTER_SECTION_CONTAINER:MORE_FILTERS_AMENITIES_WITH_SUBCATEGORIES']//button[starts-with(@id,'filter-item-amenities-')]";
        const xpathBase = "//button[starts-with(@id,'filter-item-amenities-')]";
        const xpathCondition = `[contains(.,'${amenityName}')]`;
        return $(`${xpathBase}${xpathCondition}`);
    }
    public async isAmenitiesElementPresent(amenityName: string, timeout: number = 5000): Promise<boolean> {
        try {
            const element = await this.amenitiesElement(amenityName);
            // await element.waitForDisplayed({ timeout });
            await element.waitForClickable({ timeout });
            return true;
        } catch (error) {
            return false;
        }
    }
    /**
     * Click on the amenities element with the given name
     * @param amenityName - The name of the amenity to click on
     */
    public async clickAmenitiesElement(amenityName: string){
        const element = await this.amenitiesElement(amenityName);
        await element.waitForClickable();
        await element.click();
    }

    public async waitForFiltersDialogToClose(){
        await this.filtersDialog.waitForDisplayed({ timeout: 7000, reverse: true });
    }

}

export default new AdvancedSearchPageObjects();