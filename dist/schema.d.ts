import { LionErrorList, ParsingContext } from "./context";
import { DocumentComponent } from "./types";
/**
 * Represents a schema component that can validate a document component against a specified type.
 */
export declare class SchemaComponent {
    type: string;
    of?: SchemaComponent;
    context: ParsingContext;
    isOptional: boolean;
    constructor(type: string, isOptional: boolean | undefined, context: ParsingContext, of?: SchemaComponent);
    validate(value: DocumentComponent): boolean;
    toString(): string;
}
export declare class MultipleSchemaComponent extends SchemaComponent {
    types: SchemaComponent[];
    constructor(types: SchemaComponent[], isOptional: boolean | undefined, context: ParsingContext);
    validate(value: DocumentComponent): boolean;
    toString(): string;
}
/**
 * Represents a schema.
 */
export declare class Schema {
    components: Map<string, SchemaComponent>;
    context: ParsingContext;
    constructor(context: ParsingContext);
    addComponent(name: string, component: SchemaComponent): void;
    validate(value: DocumentComponent, process?: boolean, clear?: boolean): boolean;
    toTypeCheck(): TypeCheck;
    stringify(): string;
    stringifyAsSubSchema(name: string): string;
}
/**
 * The `TypeRegistry` class is a singleton that manages the registration and validation of types and schemas.
 * It provides methods to register types and sub-schemas, retrieve types, and validate values against types.
 *
 * @remarks
 * This class is designed to be used as a singleton, with the single instance accessible via `TypeRegistry.instance`.
 *
 * @example
 * ```typescript
 * // Register a type
 * this.registerType('MyType', myTypeCheckFunction);
 *
 * // Register a sub-schema
 * this.registerSubSchema('MySchema', mySchema);
 *
 * // Validate a value against a type
 * const isValid = this.validateType('MyType', myValue);
 * ```
 */
export declare class TypeRegistry {
    types: Map<string, TypeCheck>;
    subSchemas: Map<string, Schema>;
    errors: LionErrorList;
    constructor(errors: LionErrorList);
    private loadBuiltInTypes;
    registerType(name: string, check: TypeCheck): void;
    registerSubSchema(name: string, schema: Schema): void;
    hasType(type: string): boolean;
    getType(type: string): TypeCheck;
    validateType(type: SchemaComponent, value: DocumentComponent): boolean;
    extractType(type: string): [string, string] | [string];
}
/**
 * A type alias for a function that checks the type of a given value.
 *
 * @param value - The value to be checked, which is of type `DocumentComponent`.
 * @param of - An optional parameter that is another `SchemaComponent`.
 * @returns A boolean indicating whether the value passes the type check.
 */
export type TypeCheck = (value: DocumentComponent, of?: SchemaComponent) => boolean;
