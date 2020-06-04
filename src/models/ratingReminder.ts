import "reflect-metadata";
import { Reminder } from "./reminder";
import { RRuleSet, RRule } from "./rrule";

export class RatingReminder extends Reminder {
    constructor(interval: number, frequency: number) {
        super();
        const startdate = RRuleSet.toUTC(this.createdAt);
        this.recurrenceRules = RRuleSet.make();
        this.recurrenceRules.rrule(
            new RRule(
                {
                    dtstart: startdate,
                    interval: interval || 0,
                    freq: frequency || 0,
                    byhour: 7,
                    byminute: 0,
                    bysecond: 0,
                    tzid: RRuleSet.localTimezone,
                    wkst: RRuleSet.weekstart
                },
                true
            )
        );
        this.recurrenceRules.exdate(startdate);
    }

    get isCompleted() {
        return this.interval == 0;
    }
    get interval() {
        return this.recurrenceRules?.currentRule?.origOptions.interval;
    }
    set interval(value) {
        this.recurrenceRules = this.recurrenceRules?.updatingCurrentRule({
            interval: value
        });
    }
    get frequency() {
        return this.recurrenceRules?.currentRule?.origOptions.freq;
    }
    set frequency(value) {
        this.recurrenceRules = this.recurrenceRules?.updatingCurrentRule({
            freq: value
        });
    }
    get nextRating() {
        return this.recurrenceRules?.next(new Date());
    }
}
