import { Injectable } from '@nestjs/common';
import { toDate, fromZonedTime, format as formatDate } from 'date-fns-tz';

@Injectable()
export class DateService {
  dtoToDate(dateISO: string | Date): Date {
    return toDate(dateISO, { timeZone: process.env.TZ });
  }

  now() {
    return fromZonedTime(new Date(), null);
  }

  format(date: Date, format: string) {
    return formatDate(date, format, { timeZone: process.env.TZ });
  }
}
