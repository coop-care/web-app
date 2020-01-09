import "reflect-metadata";
import { Type } from "class-transformer";
import { Base } from "./base";
import { Rating } from "./rating";

export class Outcome extends Base {
    @Type(() => Date)
    createdAt: Date | undefined;
    @Type(() => Rating)
    knowledge = new Rating();
    @Type(() => Rating)
    behaviour = new Rating();
    @Type(() => Rating)
    status = new Rating();
    personRatedInPlaceOfOwner = "";
}
