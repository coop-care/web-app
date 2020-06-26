import "reflect-metadata";
import { Type } from "class-transformer";
import { Base } from "./base";

export class Rating extends Base {
    observation = 0;
    expectation = 0;
    comment = "";
}

// preferred modeL:

// export class Rating extends Base {
//     @Type(() => Date)
//     createdAt = new Date();
//     knowledge = 0;
//     behaviour = 0;
//     status = 0;
//     comment = "";
//     user = "";
// }
