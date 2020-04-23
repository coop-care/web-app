import "reflect-metadata";
import { Type, plainToClass } from "class-transformer";
import { ObjectID } from "bson";
import { MasterData } from "./masterData";
import { ProblemRecord } from "./problemRecord";

export class Client {
    // optional properties need an initial value because Vue does not detect the addition or removal of a property
    _id?: ObjectID = undefined;
    user_id = "";
    name = "";
    @Type(() => MasterData)
    masterDataHistory: MasterData[] = [];
    @Type(() => ProblemRecord)
    problems: ProblemRecord[] = [];
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    leftAt?: Date = undefined;

    static fromObject(object: unknown): Client | Client[] {
        // migration from database happens here:
        const isArray = object instanceof Array;
        object = isArray ? object : [object];
        object = (object as any[]).map(object => {
            object.problems = object.problems.map((problem: any) => {
                if ((problem.interventions || []).length) {
                    problem.reminders = problem.interventions.map(
                        (intervention: any) => {
                            return {
                                startDate: intervention.startedAt,
                                completionDate:
                                    intervention.endedAt || undefined,
                                categoryCode: intervention.categoryCode,
                                targetCode: intervention.targetCode,
                                details: intervention.details[0].text,
                                __type: "intervention"
                            };
                        }
                    );
                    delete problem.interventions;
                }
                return problem;
            });
            return object;
        });
        object = isArray ? object : (object as any[])[0];
        // – migration end

        return plainToClass(Client, object);
    }

    constructor(userId: string, name: string) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.user_id = userId;
        this.name = name;
    }

    findProblemRecord(id: string) {
        return this.problems.find(problem => problem.id == id);
    }

    equals(client: Client) {
        return this._id?.equals(client._id || "") || false;
    }
}
