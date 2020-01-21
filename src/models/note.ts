import "reflect-metadata";
import { Type } from "class-transformer";

export class Note {
    text = "";
    @Type(() => Date)
    createdAt = new Date();
}
