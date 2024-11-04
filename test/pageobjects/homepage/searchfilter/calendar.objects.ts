import Page from '../../../page';
import { $ } from '@wdio/globals';
import { $$ } from '@wdio/globals';
import { StringParser } from '../../../utils/string-parser.js';
class CalendarObjects extends Page {


    /**
     * @returns {Element}
     * Input for entering the check in date
     * This is the input field that is displayed after the check in date is selected
     */
    public get checkInDateInput(){
        return $("//form[@role='search']//div[.='Check in']/following-sibling::div");
    }

    /**
     * @returns {Element}
     * Input for entering the check out date
     * This is the input field that is displayed after the check out date is selected
     */
    public get checkOutDateInput(){
        return $("//form[@role='search']//div[.='Check out']/following-sibling::div");
    }


// need to scroll through the months until the given month container is visible
    // this is called during the date selection, to make sure the calendar containter for the searched month is displayed
    public async scrollToMonthYear(date: Date) {
        const monthYear = StringParser.calendarMonthAndYearStringByDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        console.log("monthYear: ", monthYear);
        
        var monthCalendarContainerDisplayed = await this.getMonthCalendarContainer(monthYear).isDisplayed();
        while (!monthCalendarContainerDisplayed) {
            await this.clickNextMonthButton();
            monthCalendarContainerDisplayed = await this.getMonthCalendarContainer(monthYear).isDisplayed();
        }
    }

    // this is called during the date selection, to select the correct date
    // to be calles from the test file
    public async selectDate(date: Date) {
        await this.scrollToMonthYear(date);
        await this.clickOnMonthSelectableValueByDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
    /**
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @returns {ElementArray}
     * Returns a list of selectable values for the given date
     * based on the date given as params
     * it creates the calendar month and year string and then uses it to build the selector
     * to get the list of selectable values
     */
    public async getListOfMonthSelectableValuesByDate(year: number, month: number, day: number) {
        
        const monthYearString = StringParser.calendarMonthAndYearStringByDate(year, month, day);
        const selector = `//h2[@elementtiming='LCP-target' and contains(text(), '${monthYearString}')]/ancestor::div/following-sibling::table[@role='presentation']//tr//td[@role='button']//div//div`;
        return await $$(selector);
    }


    private async clickOnMonthSelectableValueByDate(year: number, month: number, day: number) {
        const listOfMonthSelectableValues = await this.getListOfMonthSelectableValuesByDate(year, month, day);
        const elements = await listOfMonthSelectableValues.map(async (dayElement) => await dayElement);
        for (const dayElement of elements) {
            if (await dayElement.getText() === day.toString()) {
                await dayElement.click();
                break;
            }
        }
    }

    public get calendarContainer() {
        return $("div[aria-label='Calendar']");
    }

    public getMonthCalendarContainer(monthYear: string) {
        return $(`//div[@data-visible='true'][.//h2[@elementtiming='LCP-target' and contains(text(), '${monthYear}')]]//table[@role='presentation']`);
    }
    /**
     * @param {string} monthYear
     * @returns {ElementArray}
     * Returns a list of visible month calendar rows for the given month and year
     */
    public getVisibleMonthCalendarRows(monthYear: string) {
        return $$(
            `//div[@data-visible='true'][.//h2[@elementtiming='LCP-target' and contains(text(), '${monthYear}')]]//table[@role='presentation']//tr`
        );
    }


    public get nextMonthButton() {
        return $("div[aria-label='Calendar'] button[aria-label*='Move forward to switch']");
    }

    public get previousMonthButton() {
        return $("div[aria-label='Calendar'] button[aria-label*='Move backward to switch']");
    }

    public async clickNextMonthButton() {
        await this.nextMonthButton.click();
    }

    public async clickPreviousMonthButton() {
        await this.previousMonthButton.click();
    }

    public convertDateToInputFormat(date: Date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

}

export default new CalendarObjects();