import Page from '../../page.js';

class GuestsPageObjects extends Page {

    public get guestsWhoButton() {
        return $("//form[@role='search']//div[.='Who']/following-sibling::div");
    }

     async clickGuestsWhoButton() {
        await this.guestsWhoButton.waitForDisplayed();
        await this.guestsWhoButton.click();
    }

    private get searchButton() {
        return $("//form[@role='search']//button[.='Search']");
    }

    public async search() {
        await this.searchButton.waitForDisplayed();
        await this.searchButton.click();
    }

    public get guestsInput() {
        return $("//form[@role='search']//div[.='Who']/following-sibling::div");
    }


    public get guestsAdultsOptionContainer(){
        return $("//form[@role='search']//div[.='Adults']");
    }

    public get guestsChildrenOptionContainer(){
        return $("//form[@role='search']//div[.='Children']");
    }

    public get guestsAdultsDecreaseButton(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-adults'][@aria-label='decrease value']");
    }

    public get guestsChildrenDecreaseButton(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-children'][@aria-label='decrease value']");
    }

    public async clickGuestsChildrenDecreaseButton(){
        await this.guestsChildrenDecreaseButton.waitForDisplayed();
        await this.guestsChildrenDecreaseButton.click();
    }

    public async clickGuestsAdultsDecreaseButton(){
        await this.guestsAdultsDecreaseButton.waitForDisplayed();
        await this.guestsAdultsDecreaseButton.click();
    }

    public get guestsAdultsIncreaseButton(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-adults'][@aria-label='increase value']");
    }

    public get guestsChildrenIncreaseButton(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-children'][@aria-label='increase value']");
    }

    public async clickGuestsChildrenIncreaseButton(){
        await this.guestsChildrenIncreaseButton.waitForDisplayed();
        await this.guestsChildrenIncreaseButton.click();
    }

    public async clickGuestsAdultsIncreaseButton(){
        await this.guestsAdultsIncreaseButton.waitForDisplayed();
        await this.guestsAdultsIncreaseButton.click();
    }

    public get guestsAdultsInput(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-adults'][@aria-label='decrease value']/following-sibling::div//span[@aria-hidden='true']");
    }

    public get guestsChildrenInput(){
        return $("//form[@role='search']//*[@aria-describedby='searchFlow-title-label-children'][@aria-label='decrease value']/following-sibling::div//span[@aria-hidden='true']");
    }

    public async getGuestsAdultsInputValue(){
        await this.guestsAdultsInput.waitForDisplayed();
        return await this.guestsAdultsInput.getText();
    }

    public async getGuestsChildrenInputValue(){
        await this.guestsChildrenInput.waitForDisplayed();
        return await this.guestsChildrenInput.getText();
    }

    public async setGuestsAdultsInputValue(value: number){
        await this.guestsAdultsOptionContainer.waitForDisplayed();
        let currentValue = await this.getGuestsAdultsInputValue();
        while (parseInt(currentValue) < value) {
            await this.guestsAdultsIncreaseButton.waitForDisplayed();
            await this.guestsAdultsIncreaseButton.click();
            currentValue = await this.getGuestsAdultsInputValue();
        }
        while (parseInt(currentValue) > value) {
            await this.guestsAdultsDecreaseButton.waitForDisplayed();
            await this.guestsAdultsDecreaseButton.click();
            currentValue = await this.getGuestsAdultsInputValue();
        }
    }

    public async setGuestsChildrenInputValue(value: number){
        await this.guestsChildrenOptionContainer.waitForDisplayed();
        let currentValue = await this.getGuestsChildrenInputValue();
        while (parseInt(currentValue) < value) {
            await this.guestsChildrenIncreaseButton.waitForDisplayed();
            await this.guestsChildrenIncreaseButton.click();
            currentValue = await this.getGuestsChildrenInputValue();
        }
        while (parseInt(currentValue) > value) {
            await this.guestsChildrenDecreaseButton.waitForDisplayed();
            await this.guestsChildrenDecreaseButton.click();
            currentValue = await this.getGuestsChildrenInputValue();
        }
    }
}

export default new GuestsPageObjects();