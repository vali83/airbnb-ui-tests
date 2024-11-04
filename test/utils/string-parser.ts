export class StringParser {
    static extractNumber(text: string): number {
        // Remove spaces and convert to lowercase
        const cleanText = text.toLowerCase().replace(/\s+/g, '');
        
        // Extract first number from string
        const match = cleanText.match(/\d+/);
        
        return match ? parseInt(match[0]) : 0;
    }

    static extractId(text: string, prefix: string = 'title_'): string {
        return text.replace(prefix, '');
    }

    // Alternative using split
    static extractIdAlt(text: string, prefix: string = 'title_'): string {
        return text.split(prefix)[1];
    }

    static calendarMonthAndYearStringByDate(year: number, month: number, day: number):string {
        const date = new Date(year, month - 1, day);
        const monthName = date.toLocaleString('en-US', { month: 'long' });
        const formattedString = `${monthName} ${year}`;
        return formattedString;
    }

    static formatDateRange = (checkIn: Date, checkOut: Date): string => {
        const sameMonth = checkIn.getMonth() === checkOut.getMonth();
        const checkInStr = checkIn.toLocaleString('en-US', { month: 'short', day: 'numeric' });
        
        return sameMonth 
            ? `${checkInStr} – ${checkOut.getDate()}`
            : `${checkInStr} – ${checkOut.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    static stripLocationFromText(text: string): string {
        const getFirstPart = (text: string): string => text.split(',')[0].trim();
        return getFirstPart(text);
    }
} 
