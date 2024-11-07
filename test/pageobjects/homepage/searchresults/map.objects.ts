import { IListing } from 'models/listing.interface.js';
import Page from '../../page.js';
import { StringParser } from '../../../utils/string-parser.js';

class MapPageObjects extends Page {

// TODO: add map container element
// TODO: add map pin elements
// TODO: add map  pin element by listing text and price 
  //button[@data-veloute='map/markers/BasePillMarker'][contains(.,'Apartment in Appio Latino') and contains(.,'461')]


    public get mapContainer() {
        return $("");
    }

    public getMapPinElementByListingTextAndPrice(listingText: string, price: number) {
        return $(`//button[@data-veloute='map/markers/BasePillMarker'][contains(.,'${listingText}') and contains(.,'${price}')]/div/div`);
    }

    public async waitForMapPinElementTitleToLoad(listingText: string, price: number) {
        await this.getMapPinElementByListingTextAndPrice(listingText, price).waitForDisplayed();
        await this.getMapPinElementByListingTextAndPrice(listingText, price).waitForClickable();
    }

    public async checkStyleChangeOnHover(elementToHover: ChainablePromiseElement, elementToCheck: ChainablePromiseElement) : Promise<boolean> {
        await elementToHover.waitForClickable();
        await elementToCheck.waitForDisplayed();
    
        const initialBackgroundColor = await elementToCheck.getCSSProperty('background-color');
        const initialColor = await elementToCheck.getCSSProperty('color');
            
        await elementToHover.moveTo();
        await browser.pause(500);
        
        const afterBackgroundColor = await elementToCheck.getCSSProperty('background-color');
        const afterColor = await elementToCheck.getCSSProperty('color');
        
        return (initialBackgroundColor.value !== afterBackgroundColor.value) && (initialColor.value !== afterColor.value  );

    }

    private async findClickableSpot(element: ChainablePromiseElement): Promise<{x: number, y: number} | null> {
        // Get element dimensions and location
        const elementRect = await element.getLocation();
        const size = await element.getSize();
        
        // Define points to try (in order of preference)
        const pointsToTry = [
            // Center
            { x: 0.5, y: 0.5 },
            // Corners
            { x: 0.1, y: 0.1 }, // Top-left
            { x: 0.9, y: 0.1 }, // Top-right
            { x: 0.1, y: 0.9 }, // Bottom-left
            { x: 0.9, y: 0.9 }, // Bottom-right
            // Edges
            { x: 0.5, y: 0.1 }, // Top
            { x: 0.5, y: 0.9 }, // Bottom
            { x: 0.1, y: 0.5 }, // Left
            { x: 0.9, y: 0.5 }  // Right
        ];
    
        for (const point of pointsToTry) {
            const x = Math.floor(elementRect.x + (size.width * point.x));
            const y = Math.floor(elementRect.y + (size.height * point.y));
            
            try {
                // Try to move to this point
                await browser.performActions([{
                    type: 'pointer',
                    id: 'mouse',
                    parameters: { pointerType: 'mouse' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x, y }
                    ]
                }]);
                
                // Check if element is actually being hovered
                const isHovered = await element.isDisplayed() && 
                                await browser.execute((coords, targetElement) => {
                                    const elementAtPoint = document.elementFromPoint(coords.x, coords.y);
                                    // return elementAtPoint === document.querySelector(`[data-element="${targetElement}"]`);
                                    return elementAtPoint === targetElement;
                                }, { x, y }, await element.getElement());
                
                if (isHovered) {
                    return { x, y };
                }
            } catch (e) {
                continue;
            }
        }
        
        return null;
    }

    public async clickPartiallyVisiblePin(pinElement: ChainablePromiseElement) {
        const clickableSpot = await this.findClickableSpot(pinElement);
        
        if (!clickableSpot) {
            throw new Error('Could not find clickable spot on pin');
        }
        
        // Move to the found spot and click
        await browser.performActions([{
            type: 'pointer',
            id: 'mouse',
            parameters: { pointerType: 'mouse' },
            actions: [
                { type: 'pointerMove', duration: 0, x: clickableSpot.x, y: clickableSpot.y },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
    }

    /**
     * @description Get the container of the map pin listing element
     * @returns {ChainablePromiseElement}
     * needs to be under //div[@aria-label='Map'], otherwise it returns the elements that are on the grid and not from the map
     */
    public get mapPinListingElementContainer() {
        return $(`//div[@aria-label='Map']/following-sibling::div//div[starts-with(@aria-labelledby,'title_')]`);
    }
    
    public get mapPinListingElementTitle() {
        return this.mapPinListingElementContainer.$(`//div[starts-with(@id,'title_')]`);
    }

    public get mapPinListingElementSubtitle() {
        return this.mapPinListingElementContainer.$(`//div[starts-with(@id,'title_')]/following-sibling::div[1]`);
    }
    public get mapPinListingElementBeds() {
        return this.mapPinListingElementContainer.$(`//div[starts-with(@id,'title_')]/following-sibling::div[contains(.,'bed')]`);
    }
    public get mapPinListingElementBedrooms() {
        return this.mapPinListingElementContainer.$(`//div[starts-with(@id,'title_')]/following-sibling::div[contains(.,'bedroom')]`);
    }
    public get mapPinListingElementPricePerNight() {
        return this.mapPinListingElementContainer.$(`//div[starts-with(@id,'title_')]/following-sibling::div//span[contains(text(),'per night')]`);
    }

    public async extractListingData(): Promise<IListing> {
        const property: IListing = {};
        const titleElement : ChainablePromiseElement =  await this.mapPinListingElementTitle;
        const subtitleElement : ChainablePromiseElement =  await this.mapPinListingElementSubtitle;
        const bedsElement : ChainablePromiseElement =  await this.mapPinListingElementBeds;
        const bedroomsElement : ChainablePromiseElement =  await this.mapPinListingElementBedrooms;
        const pricePerNightElement : ChainablePromiseElement =  await this.mapPinListingElementPricePerNight;

        property.title  = await this.safeGetText(titleElement);
        property.description = await this.safeGetText(subtitleElement);
        property.beds = await this.safeGetNumber(bedsElement);
        property.bedrooms = await this.safeGetNumber(bedroomsElement);
        const pricePerNightText = await this.safeGetText(pricePerNightElement);
        if (pricePerNightText) {
            property.pricePerNight = StringParser.extractPrice(pricePerNightText);
        }
        return property;
    }
}

export default new MapPageObjects();