import { Region } from "./lexer";
import { Schema } from "./schema";
/**
 * Represents a primitive value which can be a number, string, or boolean.
 */
export type ValuePrimitive = number | string | boolean;
/**
 * Represents a Lion document.
 */
export declare class LionDocument {
    doc: DocumentComponent;
    schema: Schema;
    hasSchema: boolean;
    constructor(document: DocumentComponent, schema?: Schema);
    get(key: string): DocumentComponent | ValuePrimitive | undefined;
    set(key: string, value: ValuePrimitive): void;
    validate(silent?: boolean): boolean;
    stringify(): string;
    private stringifyValue;
    private stringifyObject;
}
/**
 * Represents a document component that can hold a primitive value or a collection of other document components.
 * Extends the Map class to allow hierarchical structuring of document components.
 *
 * @class DocumentComponent
 * @extends {Map<string, DocumentComponent>}
 */
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
