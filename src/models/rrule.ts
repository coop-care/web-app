import "reflect-metadata";
import { RRuleSet as RuleSet, RRule, Frequency, Options, Weekday } from "rrule";
import { DateTime } from "luxon";
import { classToClass } from "class-transformer";

type GetText = (id: string | number | Weekday) => string;
interface Language {
    dayNames: string[];
    monthNames: string[];
    tokens: {
        [k: string]: RegExp;
    };
}
type DateFormatter = (year: number, month: string, day: number) => string;

class RRuleSet extends RuleSet {
    static fromJSON(json: any) {
        if (json == undefined) {
            return undefined;
        }

        json = JSON.parse(JSON.stringify(json));

        const ruleSet = new RRuleSet(true);
        ruleSet.tzid(json.tzid);
        json.rrules?.forEach((options: any) =>
            ruleSet.rrule(RRuleSet.makeRuleFromJSON(options))
        );
        json.exrules?.forEach((options: any) =>
            ruleSet.exrule(RRuleSet.makeRuleFromJSON(options))
        );
        json.rdates?.forEach((dateString: string) =>
            ruleSet.rdate(new Date(dateString))
        );
        json.exdates?.forEach((dateString: string) =>
            ruleSet.exdate(new Date(dateString))
        );

        return ruleSet;
    }

    private static makeRuleFromJSON(json: any) {
        if (json.dtstart != undefined) {
            json.dtstart = new Date(json.dtstart);
        }
        if (json.until != undefined) {
            json.until = new Date(json.until);
        }
        if (json.wkst != undefined && json.wkst.weekday != undefined) {
            json.wkst = json.wkst.weekday;
        }
        return new RRule(json, true);
    }

    static make() {
        const ruleSet = new RRuleSet(true);
        ruleSet.tzid(RRuleSet.localTimezone);
        return ruleSet;
    }

    static toUTC(date: Date) {
        return new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
            )
        );
    }

    static fromUTC(date: Date) {
        return DateTime.fromJSDate(date)
            .toUTC()
            .setZone("local", { keepLocalTime: true })
            .toJSDate();
    }

    static optionalFromUTC(date?: Date) {
        if (!date) {
            return date;
        }
        return RRuleSet.fromUTC(date);
    }

    static convert(date?: Date | null, timezone?: string | null) {
        if (!date) {
            return date;
        }
        return DateTime.fromJSDate(date, { zone: timezone || undefined })
            .toUTC()
            .setZone(RRuleSet.localTimezone, { keepLocalTime: true })
            .toJSDate();
    }

    static get localTimezone() {
        return DateTime.local().zoneName;
    }

    static get weekstart() {
        /* Hard-coded to Monday and could be replaced only by a team-setting,
           if you want to update all rules when team-setting is changed. */
        return 0;
    }

    private static updateRule(
        rule: RRule,
        changes: Partial<Options>,
        overwriteAllValues = false
    ) {
        for (const key in changes) {
            const value = changes[key as keyof Options];

            if (value instanceof Date) {
                (changes as any)[key] = RRuleSet.toUTC(value);
            }
        }

        const options = overwriteAllValues
            ? {
                  tzid: rule.origOptions.tzid,
                  wkst: classToClass(rule.origOptions.wkst)
              }
            : classToClass(rule.origOptions);
        Object.assign(options, changes);
        return new RRule(options, !rule._cache);
    }

    get isRecurring() {
        return this._rrule.length > 0;
    }

    get indicesOfActiveRules() {
        if (this.isRecurring) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const date = RRuleSet.toUTC(startOfDay);
            const result: number[] = [];
            let ruleIndexForMaxStart = this._rrule.length - 1;

            this._rrule.forEach((rule, index) => {
                if (rule.after(date, true)) {
                    result.push(index);
                }

                if (
                    (this._rrule[
                        ruleIndexForMaxStart
                    ].origOptions.dtstart?.getTime() || 0) <
                    (rule.origOptions.dtstart?.getTime() || 0)
                ) {
                    ruleIndexForMaxStart = index;
                }
            });

            return result.length ? result : [ruleIndexForMaxStart];
        } else {
            return [-1];
        }
    }

    get initialStartDate() {
        const minTimestamp = Math.min(
            ...this._rrule
                .map(rule => rule.options.dtstart.getTime())
                .concat(this._rdate.map(date => date.getTime()))
        );
        return minTimestamp != Infinity
            ? RRuleSet.fromUTC(new Date(minTimestamp))
            : undefined;
    }

    get firstRule(): RRule | undefined {
        return this.rrules().shift();
    }

    startDate(ruleIndex: number) {
        if (ruleIndex >= 0) {
            return (
                this.dateFromOption(ruleIndex, options => options.dtstart) ||
                new Date()
            );
        } else {
            return RRuleSet.fromUTC(
                this._rdate[0] || RRuleSet.toUTC(new Date())
            );
        }
    }

    endDate(ruleIndex: number) {
        return this.dateFromOption(ruleIndex, options => options.until);
    }

    dateFromOption(
        ruleIndex: number,
        valueGetter: (options: Partial<Options>) => Date | undefined | null
    ) {
        const date = valueGetter(this.rrules()[ruleIndex]?.origOptions || {});
        return date ? RRuleSet.fromUTC(date) : undefined;
    }

    updatingStartDate(ruleIndex: number, value: Date): RRuleSet {
        if (ruleIndex >= 0) {
            return this.updatingRule(ruleIndex, { dtstart: value });
        } else {
            const rules = new RRuleSet(!this._cache);
            rules.tzid(this.tzid());
            rules.rdate(RRuleSet.toUTC(value));
            return rules;
        }
    }

    private replacingRules(newRules: RRule[]) {
        const ruleSet = new RRuleSet(!this._cache);

        newRules.forEach(rule => ruleSet.rrule(rule));
        this._exrule.forEach(rule => ruleSet.exrule(rule));
        this._rdate.forEach(date => ruleSet.rdate(date));
        this._exdate.forEach(date => ruleSet.exdate(date));
        ruleSet.tzid(this.tzid());

        return ruleSet;
    }

    private ruleIndexMatchingDate(date = new Date()) {
        const dateAsUTC = RRuleSet.toUTC(date);
        return this._rrule.findIndex(
            rule => rule.between(dateAsUTC, dateAsUTC, true).length > 0
        );
    }

    private ruleIndexIncludingDate(date = new Date()) {
        const dateAsUTC = RRuleSet.toUTC(date);
        const timestamp = dateAsUTC.getTime();
        return this._rrule.findIndex(rule => {
            const until = rule.origOptions.until;
            const count = rule.origOptions.count;
            return (
                (rule.origOptions.dtstart?.getTime() || 0) <= timestamp &&
                ((until == undefined && count == undefined) ||
                    (until != undefined && until.getTime() >= timestamp) ||
                    (count != undefined && !!rule.after(dateAsUTC, true)))
            );
        });
    }

    updatingRule(
        index: number,
        options: Partial<Options>,
        overwriteAllValues = false
    ): RRuleSet {
        const rules = this.rrules();
        const rule = rules[index];

        if (!rule) {
            return this;
        }

        rules.splice(
            index,
            1,
            RRuleSet.updateRule(rule, options, overwriteAllValues)
        );
        return this.replacingRules(rules);
    }

    updatingAllRules(options: Partial<Options>): RRuleSet {
        const rules = this.rrules().map(rule =>
            RRuleSet.updateRule(rule, options)
        );
        return this.replacingRules(rules);
    }

    deletingRule(index: number): RRuleSet {
        const rules = this.rrules();
        rules.splice(index, 1);
        return this.replacingRules(rules);
    }

    endingRules(endDate: Date) {
        const endDateAsUTC = RRuleSet.toUTC(endDate);
        const endDateTimestamp = endDateAsUTC.getTime();
        const rules = this.rrules().map(rule => {
            if (
                !rule.origOptions.until ||
                rule.origOptions.until.getTime() > endDateTimestamp
            ) {
                return RRuleSet.updateRule(rule, { until: endDate });
            } else {
                return rule;
            }
        });
        return this.replacingRules(rules);
    }

    movingRules(from: Date, to: Date, isSingleMove = false) {
        if (this._rdate.length && !this._rrule.length) {
            return this.updatingStartDate(-1, to);
        }

        const ruleIndex = this.ruleIndexMatchingDate(from);

        if (ruleIndex < 0 || from.getTime() == to.getTime()) {
            return this;
        }

        const rules = this.rrules();
        const rule = rules[ruleIndex];
        const count = rule.origOptions.count;
        const originalTo = to;
        const next = isSingleMove
            ? RRuleSet.optionalFromUTC(rule.after(RRuleSet.toUTC(from), false))
            : undefined;
        to = next || to;

        if (count == undefined) {
            const firstRule = RRuleSet.updateRule(rule, {
                until: new Date(from.getTime() - 1)
            });

            if (
                !rule.origOptions.until ||
                to.getTime() <= rule.origOptions.until.getTime()
            ) {
                const secondRule = RRuleSet.updateRule(rule, {
                    dtstart: to
                });
                rules.splice(ruleIndex, 1, firstRule, secondRule);
            } else {
                rules.splice(ruleIndex, 1, firstRule);
            }
        } else {
            const pastCount =
                rule.between(
                    rule.origOptions.dtstart || new Date(0),
                    RRuleSet.toUTC(from),
                    true
                ).length - 1;
            const firstRule = RRuleSet.updateRule(rule, {
                count: pastCount
            });
            const secondRule = RRuleSet.updateRule(rule, {
                dtstart: to,
                count: count - pastCount - (next ? 1 : 0)
            });
            rules.splice(ruleIndex, 1, firstRule, secondRule);
        }

        if (next) {
            const thirdRule = RRuleSet.updateRule(
                rule,
                {
                    dtstart: originalTo,
                    count: 1
                },
                true
            );
            rules.push(thirdRule);
        }

        return this.replacingRules(rules);
    }

    toText(
        gettext?: GetText,
        language?: Language,
        dateFormatter?: DateFormatter,
        ruleIndex = -1
    ) {
        const rules = this.rrules();
        const rule = rules[ruleIndex] || rules[this.ruleIndexIncludingDate()];
        if (rule) {
            return rule.toText(gettext, language, dateFormatter);
        } else if (this._rdate.length && language && dateFormatter) {
            const date = this.startDate(-1);
            return dateFormatter(
                date.getFullYear(),
                language.monthNames[date.getMonth()] || "",
                date.getDate()
            );
        } else {
            return "";
        }
    }

    toLocalizedText(
        locale: string,
        translationDict: { [key: string]: string },
        language: Language,
        ruleIndex = -1
    ) {
        return this.toText(
            key => translationDict[key.toString()] || key.toString(),
            language,
            (year, month, day) =>
                new Date([day, month, year].join(" ")).toLocaleString(
                    locale,
                    DateTime.DATE_MED
                ),
            ruleIndex
        );
    }

    between(
        after: Date,
        before: Date,
        inc?: boolean,
        iterator?: (d: Date, len: number) => boolean
    ): Date[] {
        return super
            .between(
                RRuleSet.toUTC(after),
                RRuleSet.toUTC(before),
                inc,
                iterator
            )
            .map(RRuleSet.fromUTC);
    }

    previous(date: Date, inc?: boolean) {
        return RRuleSet.optionalFromUTC(
            super.before(RRuleSet.toUTC(date), inc)
        );
    }

    next(date: Date, inc?: boolean) {
        return RRuleSet.optionalFromUTC(super.after(RRuleSet.toUTC(date), inc));
    }

    hasNext(date?: Date) {
        return !!super.after(RRuleSet.toUTC(date || new Date()));
    }

    toJSON() {
        return {
            rrules: this._rrule.map(rule => rule.origOptions),
            exrules: this._exrule.map(rule => rule.origOptions),
            rdates: this._rdate,
            exdates: this._exdate,
            tzid: this.tzid()
        };
    }
}

export { RRuleSet, RRule, Frequency, Options };
