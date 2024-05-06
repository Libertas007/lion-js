import { Region } from "./lexer";
export declare class LionError {
    message: string;
    region: Region;
    description: string;
    constructor(message: string, region: Region, description?: string);
    toString(): string;
    process(): void;
}
declare class LionErrorList {
    errors: LionError[];
    processWhenAdded: boolean;
    constructor(errors?: LionError[], processWhenAdded?: boolean);
    addError(error: LionError): void;
    toString(): string;
    process(): void;
}
export declare let errors: LionErrorList;
export {};
