import "reflect-metadata";
import { Type } from "class-transformer";

export class Note {
    text: string = "";
    @Type(() => Date)
    createdAt = new Date();
}
