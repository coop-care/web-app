import "reflect-metadata";
import { Type } from "class-transformer";

export enum RecurrenceFrequency {
    Daily = 1,
    Weekly,
    Monthly,
    Yearly
}

export class RecurrenceDayOfWeek {
    dayOfTheWeek: number;
    weakNumber: number;

    constructor(dayOfTheWeek: number, weakNumber = 0) {
        this.dayOfTheWeek = dayOfTheWeek;
        this.weakNumber = weakNumber;
    }
}

export class RecurrenceEnd {
    @Type(() => Date)
    endDate?: Date;
    occurenceCount: number;

    constructor(endDate?: Date, occurenceCount = 0) {
        this.endDate = endDate;
        this.occurenceCount = occurenceCount;
    }
}

export class RecurrenceRule {
    frequency: RecurrenceFrequency;
    interval: number;
    @Type(() => Date)
    timesOfTheDay: Date[];
    @Type(() => RecurrenceDayOfWeek)
    daysOfTheWeek: RecurrenceDayOfWeek[];
    @Type(() => Number)
    daysOfTheMonth: number[];
    @Type(() => Number)
    daysOfTheYear: number[];
    @Type(() => Number)
    weeksOfTheYer: number[];
    @Type(() => Number)
    monthsOfTheYear: number[];
    @Type(() => Number)
    positions: number[];
    @Type(() => RecurrenceEnd)
    recurrenceEnd?: RecurrenceEnd;

    constructor(
        frequency: RecurrenceFrequency,
        interval: number,
        timesOfTheDay: Date[] = [],
        daysOfTheWeek: RecurrenceDayOfWeek[] = [],
        daysOfTheMonth: number[] = [],
        daysOfTheYear: number[] = [],
        weeksOfTheYer: number[] = [],
        monthsOfTheYear: number[] = [],
        positions: number[] = [],
        recurrenceEnd?: RecurrenceEnd
    ) {
        this.frequency = frequency;
        this.interval = interval;
        this.timesOfTheDay = timesOfTheDay;
        this.daysOfTheWeek = daysOfTheWeek;
        this.daysOfTheMonth = daysOfTheMonth;
        this.daysOfTheYear = daysOfTheYear;
        this.weeksOfTheYer = weeksOfTheYer;
        this.monthsOfTheYear = monthsOfTheYear;
        this.positions = positions;
        this.recurrenceEnd = recurrenceEnd;
    }
}
