import "reflect-metadata";
import { RRuleSet as RuleSet, RRule, Frequency, Options, Weekday } from "rrule";
import { DateTime } from "luxon";

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
    static fromString(str: string) {
        const toDate = (str: string) =>
            new Date(
                str.substr(0, 4) +
                    "-" +
                    str.substr(4, 2) +
                    "-" +
                    str.substr(6, 5) +
                    ":" +
                    str.substr(11, 2) +
                    ":" +
                    str.substr(13, 2)
            );
        const ruleSet = new RRuleSet(true);
        str.match(/^(DTSTART[^\n]*\n)?RRULE:[^\n]*/gm)?.forEach(match =>
            ruleSet.rrule(RRule.fromString(match))
        );
        str.match(/^EXRULE[^\n]*/gm)?.forEach(match =>
            ruleSet.exrule(RRule.fromString(match))
        );
        str.match(/^RDATE[^\n]*/gm)?.forEach(match => {
            match.match(/TZID=[^\n]*:/)?.forEach(match => {
                ruleSet.tzid(match.substring(5, match.length - 1));
            });
            match.match(/:[^\n]*/)?.forEach(match => {
                match
                    .substr(1)
                    .split(",")
                    .forEach(match => ruleSet.rdate(toDate(match)));
            });
        });
        str.match(/^EXDATE[^\n]*/gm)?.forEach(match => {
            match.match(/TZID=[^\n]*:/)?.forEach(match => {
                ruleSet.tzid(match.substring(5, match.length - 1));
            });
            match.match(/:[^\n]*/)?.forEach(match => {
                match
                    .substr(1)
                    .split(",")
                    .forEach(match => ruleSet.exdate(toDate(match)));
            });
        });
        return ruleSet;
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

    get startDate() {
        const date = this.rdates()[0] || this.currentRule?.options.dtstart;
        return RRuleSet.fromUTC(date);
    }

    get endDate() {
        const date = this.currentRule?.origOptions.until;
        return date ? RRuleSet.fromUTC(date) : undefined;
    }

    get currentRule(): RRule | undefined {
        return this.rrules()[0];
    }

    updatingStartDate(value: Date): RRuleSet {
        if (this.rrules().length) {
            return this.updatingCurrentRule({ dtstart: value });
        } else {
            const rules = new RRuleSet(!this._cache);
            rules.tzid(this.tzid());
            rules.rdate(RRuleSet.toUTC(value));
            return rules;
        }
    }

    replacingCurrentRule(options: Partial<Options>): RRuleSet {
        const currentRule = this.currentRule;
        if (!currentRule) {
            return this;
        }

        const currentRuleString = currentRule.toString();
        const newRule = new RRule(options, !currentRule._cache);
        const ruleSet = new RRuleSet(!this._cache);

        this._rrule.forEach(rule =>
            ruleSet.rrule(rule.toString() != currentRuleString ? rule : newRule)
        );
        this._exrule.forEach(rule => ruleSet.exrule(rule));
        this._rdate.forEach(date => ruleSet.rdate(date));
        this._exdate.forEach(date => ruleSet.exdate(date));
        ruleSet.tzid(this.tzid());

        return ruleSet;
    }

    updatingCurrentRule(options: Partial<Options>): RRuleSet {
        const currentRule = this.currentRule;
        if (!currentRule) {
            return this;
        }

        const newOptions = currentRule.origOptions;
        for (const key in options) {
            let value = options[key as keyof Options];

            if (value instanceof Date) {
                value = RRuleSet.toUTC(value);
            }

            (newOptions as any)[key] = value;
        }
        return this.replacingCurrentRule(newOptions);
    }

    isFullyConvertibleToText() {
        const currentRule = this.currentRule;
        if (currentRule) {
            return currentRule.isFullyConvertibleToText();
        } else {
            return true;
        }
    }

    toText(
        gettext?: GetText,
        language?: Language,
        dateFormatter?: DateFormatter
    ) {
        const currentRule = this.currentRule;
        if (currentRule) {
            return currentRule.toText(gettext, language, dateFormatter);
        } else {
            return "";
        }
    }

    toLocalizedText(
        locale: string,
        translationDict: { [key: string]: string },
        language: Language
    ) {
        return this.toText(
            key => translationDict[key.toString()] || key.toString(),
            language,
            (year, month, day) =>
                new Date([day, month, year].join(" ")).toLocaleString(
                    locale,
                    DateTime.DATE_MED
                )
        );
    }

    between(
        after: Date,
        before: Date,
        inc?: boolean,
        iterator?: (d: Date, len: number) => boolean
    ): Date[] {
        return super
            .between(after, before, inc, iterator)
            .map(RRuleSet.fromUTC);
    }

    previous(date: Date, inc?: boolean) {
        return RRuleSet.optionalFromUTC(super.before(date, inc));
    }

    next(date: Date, inc?: boolean) {
        return RRuleSet.optionalFromUTC(super.after(date, inc));
    }

    hasNext(date?: Date) {
        return !!super.after(date || new Date());
    }
}

export { RRuleSet, RRule, Frequency, Options };
