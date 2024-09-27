import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from './date.service';
import { fromZonedTime, toDate } from 'date-fns-tz';

describe('DateService', () => {
  let service: DateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateService],
    }).compile();

    service = module.get<DateService>(DateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert a DTO date string to a Date object', () => {
    const dateString = '2023-04-10T10:00:00.000Z';
    const expectedDate = toDate(dateString, { timeZone: process.env.TZ });
    const convertedDate = service.dtoToDate(dateString);
    expect(convertedDate).toEqual(expectedDate);
  });

  it('should convert a Date object to a Date object', () => {
    const date = new Date('2023-04-10T10:00:00.000Z');
    const expectedDate = toDate(date, { timeZone: process.env.TZ });
    const convertedDate = service.dtoToDate(date);
    expect(convertedDate).toEqual(expectedDate);
  });

  it('should return the current date and time', () => {
    jest.useFakeTimers();
    const expectedDate = fromZonedTime(new Date(), null);
    const currentDate = service.now();
    expect(currentDate).toEqual(expectedDate);
    jest.useRealTimers();
  });

  it('should format a date', () => {
    const date = new Date('2023-04-10T10:00:00.000Z');
    const formattedDate = service.format(date, 'dd/MM/yyyy');
    expect(formattedDate).toBe('10/04/2023');
  });
});

