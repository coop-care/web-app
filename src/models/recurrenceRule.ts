import "reflect-metadata";
import { Type } from "class-transformer";

export enum RecurrenceFrequency {
    Never,
    Daily,
    Weekly,
    Monthly,
    Yearly
}

export class RecurrenceDayOfWeek {
    dayOfTheWeek: number;
    weekNumber: number;

    constructor(dayOfTheWeek: number, weekNumber = 0) {
        this.dayOfTheWeek = dayOfTheWeek;
        this.weekNumber = weekNumber;
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
    weeksOfTheYear: number[];
    @Type(() => Number)
    monthsOfTheYear: number[];
    @Type(() => Number)
    positions: number[];
    @Type(() => Date)
    recurrenceStart?: Date;
    @Type(() => RecurrenceEnd)
    recurrenceEnd?: RecurrenceEnd;

    constructor(
        frequency: RecurrenceFrequency,
        interval = 1,
        timesOfTheDay: Date[] = [],
        daysOfTheWeek: RecurrenceDayOfWeek[] = [],
        daysOfTheMonth: number[] = [],
        daysOfTheYear: number[] = [],
        weeksOfTheYear: number[] = [],
        monthsOfTheYear: number[] = [],
        positions: number[] = [],
        recurrenceStart?: Date,
        recurrenceEnd?: RecurrenceEnd
    ) {
        this.frequency = frequency;
        this.interval = interval;
        this.timesOfTheDay = timesOfTheDay;
        this.daysOfTheWeek = daysOfTheWeek;
        this.daysOfTheMonth = daysOfTheMonth;
        this.daysOfTheYear = daysOfTheYear;
        this.weeksOfTheYear = weeksOfTheYear;
        this.monthsOfTheYear = monthsOfTheYear;
        this.positions = positions;
        this.recurrenceStart = recurrenceStart;
        this.recurrenceEnd = recurrenceEnd;
    }

    get daysOfTheWeekOnlyDays() {
        return this.daysOfTheWeek.map(day => day.dayOfTheWeek);
    }
    set daysOfTheWeekOnlyDays(values) {
        this.daysOfTheWeek = values.map(day => new RecurrenceDayOfWeek(day));
    }

    get hasOwnRecurrencePattern() {
        return (
            this.timesOfTheDay.length > 0 ||
            this.daysOfTheWeek.length > 0 ||
            this.daysOfTheMonth.length > 0 ||
            this.monthsOfTheYear.length > 0 ||
            this.positions.length > 0
        );
    }

    get frequencyUnit() {
        if (this.frequency == RecurrenceFrequency.Daily) {
            return "Day";
        } else if (this.frequency == RecurrenceFrequency.Weekly) {
            return "Week";
        } else if (this.frequency == RecurrenceFrequency.Monthly) {
            return "Month";
        } else if (this.frequency == RecurrenceFrequency.Yearly) {
            return "Year";
        } else {
            return "";
        }
    }
}
