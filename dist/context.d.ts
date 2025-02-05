import { Region } from "./lexer";
import { TypeRegistry } from "./schema";
/**
 * Represents an error specific to the Lion format.
 *
 * @remarks
 * This class is used to encapsulate error details including a message,
 * the region where the error occurred, and an optional description.
 *
 *
 * @public
 */
export declare class LionError {
    message: string;
    region: Region;
    description: string;
    constructor(message: string, region: Region, description?: string);
    toString(): string;
    process(): void;
}
export declare class LionErrorList {
    errors: LionError[];
    processWhenAdded: boolean;
    constructor(errors?: LionError[], processWhenAdded?: boolean);
    addError(error: LionError): void;
    toString(): string;
    process(): void;
}
export declare class ParsingContext {
    errors: LionErrorList;
    typeRegistry: TypeRegistry;
    constructor(errors?: LionErrorList, typeRegistry?: TypeRegistry);
}
