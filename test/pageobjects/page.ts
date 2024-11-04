import { browser } from '@wdio/globals'
import { $ } from '@wdio/globals';
import { $$ } from '@wdio/globals';

/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {
    /**
    * Opens a sub page of the page
    * @param path path of the sub page (e.g. /path/to/page.html)
    */
    public async open(path: string) {
        await browser.url(path);
    }

  

    /**
     * Safely get text from an element with timeout
     */
    protected async safeGetText(element: WebdriverIO.Element, timeout: number = 1000): Promise<string | undefined> {
        try {
            await element.waitForExist({ timeout });
            return await element.getText();
        } catch {
            return undefined;
        }
    }

    /**
     * Safely get number from an element with timeout
     */
    protected async safeGetNumber(element: WebdriverIO.Element, timeout: number = 1000): Promise<number | undefined> {
        try {
            await element.waitForExist({ timeout });
            const text = await element.getText();
            // Extract first number from string
            const match = text.match(/\d+/);
            return match ? parseInt(match[0]) : undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Safely get attribute from an element
     */
    protected async safeGetAttribute(element: WebdriverIO.Element, attribute: string): Promise<string | undefined> {
        try {
            return await element.getAttribute(attribute);
        } catch {
            return undefined;
        }
    }

    /**
     * Safely check if element exists
     */
    protected async safeIsExisting(element: WebdriverIO.Element): Promise<boolean> {
        try {
            return await element.isExisting();
        } catch {
            return false;
        }
    }

    

}
