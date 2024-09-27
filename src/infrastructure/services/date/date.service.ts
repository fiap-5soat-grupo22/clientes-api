import { Injectable } from '@nestjs/common';
import {
  toDate,
  fromZonedTime,
  format as formatDate,
  toZonedTime,
} from 'date-fns-tz';

@Injectable()
export class DateService {
  dtoToDate(dateISO: string | Date): Date {
    return toDate(dateISO, { timeZone: process.env.TZ });
  }

  now() {
    return fromZonedTime(new Date(), null);
  }

  format(
    date: Date,
    format: string,
    config: object = { timeZone: process.env.TZ },
  ) {
    return formatDate(toZonedTime(date, null), format, config);
  }
}
