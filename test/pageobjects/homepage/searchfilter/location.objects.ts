import Page from '../../page.js';
import { TestDataManager } from 'data/TestDataManager.ts';
import { BookingDates } from "../../../models/listing.interface.ts";

class LocationPageObjects extends Page {

  
    
    private locationInputSelector : string = "form[role='search'] label[for='bigsearch-query-location-input'] input#bigsearch-query-location-input";
    private locationSuggestionsContainerSelector : string = "form[role='search'] div[role='listbox']";
    private locationSuggestionsSelector : string = "form[role='search'] div[role='listbox'] div[role='option']";

    /**
     * @returns {Element}
     * Textbox for entering the location string
     */
    public get locationInput() {
        return $(this.locationInputSelector);
    }

    /**
     * @param {string} location
     * Sets the location string in the search location textbox
     */
    public async setLocation(location: string) {
        await this.locationInput.clearValue();
        await this.locationInput.click();

        // set the location test data in the text input
        await this.locationInput.setValue(location);
        

        // wait for the location suggestions to be visible for max 3 seconds 
        // to cover for low network speed or processes that might delay the suggestions
        await this.locationSuggestionsContainer.waitForDisplayed({timeout: 10000, timeoutMsg: "Location suggestions container not displayed"});
        // wait for the list loader to dissapear
        await this.locationSuggestionListLoader.waitForExist({timeout: 10000, reverse: true, timeoutMsg: "Location suggestions list loader still displayed"});
        // select the suggested location by its string value in the location suggestions list
        await this.selectSuggestedLocationByString(location);   
    }

    public async setLocationFromTestData() {
        await this.setLocation(TestDataManager.getLocation());
    }

    /*
     @returns {ElementArray}
     Container containing all the suggested options for the location entered
    */
    public get locationSuggestions() {
        return $$(this.locationSuggestionsSelector);
    }
    public get locationSuggestionsContainer(){
        return $(this.locationSuggestionsContainerSelector);
    }

    public get locationSuggestionsWhereText(){
        return $("//div[.='Where']");
    }

    public get locationSuggestionListLoader(){
        return $("//div[@id='bigsearch-query-location-listbox']//span/span");
    }

    /**
     * @param {string} location
     * Selects the suggested location by its string value
     */
    public async selectSuggestedLocationByString(location: string) {

    await this.locationSuggestionsWhereText.waitForDisplayed({timeout: 10000, timeoutMsg: "Location suggestions where text not displayed"});
    await this.locationSuggestionsWhereText.waitForClickable();
    await this.locationSuggestionsWhereText.click();

    await this.locationSuggestionsContainer.waitUntil(async () => await this.locationSuggestionsContainer.isDisplayed());

    const suggestedLocations  = await this.locationSuggestions.map(async (locationElement) => await locationElement);
       for (const locationElement of suggestedLocations) {
        if (await locationElement.getText() === location) {

            await locationElement.waitForDisplayed();
            await locationElement.waitForClickable();
            await locationElement.click();

            console.log("location suggestions container hidden", await this.locationSuggestionsContainer.isDisplayed());
            // wait for the location suggestions to be hidden
            await this.locationSuggestionsContainer.waitUntil(async () => !(await this.locationSuggestionsContainer.isDisplayed()));
            break;
        }
      }
    }
}

export default new LocationPageObjects();