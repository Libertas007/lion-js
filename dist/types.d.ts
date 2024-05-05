export type LionValue = number | string | boolean | LionValue[] | DocumentPrimitive;
export type DocumentPrimitive = {
    [key: string]: LionValue;
};
export declare class LionDocument {
    doc: DocumentPrimitive;
    constructor(document: DocumentPrimitive);
    get(key: string): LionValue;
    set(key: string, value: LionValue): void;
    stringify(): string;
    private stringifyValue;
    private stringifyObject;
}
