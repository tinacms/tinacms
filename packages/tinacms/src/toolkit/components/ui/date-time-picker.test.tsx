import moment from "moment";
import {formatCurrentDate} from "./date-time-picker"


beforeAll(()=> {
    moment.tz.setDefault('UTC');
})

describe('formatCurrentDate', ()=> {
    it('formats date with default formats', ()=> {
        const formatted = formatCurrentDate({displayDate: new Date('2024-06-15T12:00:00Z'), dateFormat: 'MMMM DD YYYY', timeFormat: 'hh:mm A'});
        expect(formatted).toBe('June 15 2024 12:00 PM');
    });
    it('formats date with date only', ()=> {
        const formatted = formatCurrentDate({displayDate: new Date('2024-06-15T12:00:00Z'), dateFormat: 'MMMM DD YYYY'});
        expect(formatted).toBe('June 15 2024');
    });
    it('formats 24 hour time', ()=> {
        const formatted = formatCurrentDate({displayDate: new Date('2024-06-15T23:00:00Z'),  dateFormat: 'MMMM DD YYYY', timeFormat: 'HH'});
        expect(formatted).toBe('June 15 2024 23');
    });
})