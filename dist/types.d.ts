import { Region } from "./lexer";
import { Schema } from "./schema";
export type ValuePrimitive = number | string | boolean;
export declare class LionDocument {
    doc: DocumentComponent;
    schema: Schema;
    hasSchema: boolean;
    constructor(document: DocumentComponent, schema?: Schema);
    get(key: string): DocumentComponent | undefined;
    set(key: string, value: ValuePrimitive): void;
    validate(silent?: boolean): boolean;
    stringify(): string;
    private stringifyValue;
    private stringifyObject;
}
export declare class DocumentComponent extends Map<string, DocumentComponent> {
    private value?;
    isArray: boolean;
    region?: Region;
    constructor(value?: ValuePrimitive, region?: Region);
    isSingleValue(): boolean;
    static fromArray(array: DocumentComponent[]): DocumentComponent;
    toArray(): DocumentComponent[];
    get(): ValuePrimitive;
    get(key: string): DocumentComponent | undefined;
}
