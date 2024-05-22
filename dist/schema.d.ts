import { DocumentComponent } from "./types";
export declare class SchemaComponent {
    type: string;
    constructor(type: string);
    validate(value: DocumentComponent): boolean;
}
export declare class Schema {
    components: Map<string, SchemaComponent>;
    constructor();
    addComponent(name: string, component: SchemaComponent): void;
    validate(value: DocumentComponent, process?: boolean, clear?: boolean): boolean;
    toTypeCheck(): TypeCheck;
    stringify(): string;
    stringifyAsSubSchema(name: string): string;
}
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
export type TypeCheck = (value: DocumentComponent, of?: TypeCheck) => boolean;
