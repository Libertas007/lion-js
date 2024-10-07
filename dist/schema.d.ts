import { DocumentComponent } from "./types";
/**
 * Represents a schema component that can validate a document component against a specified type.
 */
export declare class SchemaComponent {
    type: string;
    constructor(type: string);
    validate(value: DocumentComponent): boolean;
}
/**
 * Represents a schema.
 */
export declare class Schema {
    components: Map<string, SchemaComponent>;
    constructor();
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
 * TypeRegistry.instance.registerType('MyType', myTypeCheckFunction);
 *
 * // Register a sub-schema
 * TypeRegistry.instance.registerSubSchema('MySchema', mySchema);
 *
 * // Validate a value against a type
 * const isValid = TypeRegistry.instance.validateType('MyType', myValue);
 * ```
 */
export declare class TypeRegistry {
    static instance: TypeRegistry;
    types: Map<string, TypeCheck>;
    subSchemas: Map<string, Schema>;
    private constructor();
    registerType(name: string, check: TypeCheck): void;
    registerSubSchema(name: string, schema: Schema): void;
    getTypeOrNull(type: string): TypeCheck | null;
    hasType(type: string): boolean;
    getType(type: string): TypeCheck;
    validateType(type: string, value: DocumentComponent): boolean;
    extractType(type: string): [string, string] | [string];
}
/**
 * A type alias for a function that checks the type of a given value.
 *
 * @param value - The value to be checked, which is of type `DocumentComponent`.
 * @param of - An optional parameter that is another `TypeCheck` function.
 * @returns A boolean indicating whether the value passes the type check.
 */
export type TypeCheck = (value: DocumentComponent, of?: TypeCheck) => boolean;
