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
        return plainToClass(Client, object);
    }

    constructor(userId: string, name: string) {
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
