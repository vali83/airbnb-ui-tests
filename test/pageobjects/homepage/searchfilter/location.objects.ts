import Page from '../../page.js';


class LocationPageObjects extends Page {
    /**
     * @returns {Element}
     * Textbox for entering the location string
     */
    public get locationInput() {
        return $("form[role='search'] label[for='bigsearch-query-location-input'] input#bigsearch-query-location-input");
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

        // select the suggested location by its string value in the location suggestions list
        await this.selectSuggestedLocationByString(location);   
    }


    /*
     @returns {ElementArray}
     Container containing all the suggested options for the location entered
    */
    public get locationSuggestions() {
        return $$("form[role='search'] div[role='listbox'] div[role='option']");
    }
    public get locationSuggestionsContainer(){
        return $("form[role='search'] div[role='listbox']");
    }

    public get locationSuggestionsWhereText(){
        return $("//div[.='Where']");
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
        console.log("locationElement.getText(): ", await locationElement.getText());
        if (await locationElement.getText() === location) {
            console.log("Location Element getText matched: ", await locationElement.getText());
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