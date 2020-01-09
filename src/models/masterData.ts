import "reflect-metadata";
import { Type } from "class-transformer";

export class MasterData {
    @Type(() => Date)
    createdAt = new Date();
}
