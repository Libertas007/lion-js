export type ValuePrimitive = number | string | boolean;
export declare class LionDocument {
    doc: DocumentComponent;
    constructor(document: DocumentComponent);
    get(key: string): DocumentComponent | undefined;
    set(key: string, value: ValuePrimitive): void;
    stringify(): string;
    private stringifyValue;
    private stringifyObject;
}
export declare class DocumentComponent extends Map<string, DocumentComponent> {
    private value?;
    isArray: boolean;
    constructor(value?: ValuePrimitive);
    isSingleValue(): boolean;
    static fromArray(array: DocumentComponent[]): DocumentComponent;
    get(): ValuePrimitive;
    get(key: string): DocumentComponent | undefined;
}
