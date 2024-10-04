import { Region } from "./lexer";
import { Schema } from "./schema";

/**
 * Represents a primitive value which can be a number, string, or boolean.
 */
export type ValuePrimitive = number | string | boolean;

/**
 * Represents a Lion document.
 */
export class LionDocument {
    public doc: DocumentComponent;
    public schema: Schema;
    public hasSchema = false;

    constructor(document: DocumentComponent, schema?: Schema) {
        this.doc = document;
        this.schema = schema || new Schema();
        this.hasSchema = schema !== undefined;
    }

    public get(key: string): DocumentComponent | ValuePrimitive | undefined {
        return this.doc.get(key);
    }

    public set(key: string, value: ValuePrimitive) {
        this.doc.set(key, new DocumentComponent(value));
    }

    public validate(silent = true): boolean {
        return this.schema.validate(this.doc, !silent, true);
    }

    public stringify(): string {
        let text = "";

        if (this.hasSchema) {
            text += "@schema {\n";
            text += this.schema.stringify();
            text += "}\n";
        }

        text += "@doc {\n";
        this.doc.forEach((value, key) => {
            text += `\t${key}: ${this.stringifyValue(value)},\n`;
        });

        return text + "}";
    }

    private stringifyValue(value: DocumentComponent): string {
        if (value.isArray) {
            return `[${value
                .toArray()
                .map((e) => this.stringifyValue(e))
                .join(", ")}]`;
        }

        if (value.isSingleValue()) {
            if (typeof value.get() === "string") {
                return `"${value.get()}"`;
            }
            return value.get().toString();
        }

        return this.stringifyObject(value);
    }

    private stringifyObject(obj: DocumentComponent): string {
        let text = "{\n";
        obj.forEach((value, key) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });

        text += "}";

        return text;
    }
}

/**
 * Represents a document component that can hold a primitive value or a collection of other document components.
 * Extends the Map class to allow hierarchical structuring of document components.
 *
 * @class DocumentComponent
 * @extends {Map<string, DocumentComponent>}
 */
export class DocumentComponent extends Map<string, DocumentComponent> {
    private value?: ValuePrimitive;
    public isArray = false;
    public region?: Region;

    constructor(value?: ValuePrimitive, region?: Region) {
        super();
        this.value = value;
        this.region = region;
    }

    public isSingleValue(): boolean {
        return this.size === 0 && this.value !== undefined;
    }

    static fromArray(array: DocumentComponent[]): DocumentComponent {
        const doc = new DocumentComponent();
        array.forEach((value, index) => doc.set(index.toString(), value));
        doc.isArray = true;
        return doc;
    }

    public toArray(): DocumentComponent[] {
        return Array.from(this.values());
    }

    public get(): ValuePrimitive;
    public get(key: string): DocumentComponent | undefined;
    public get(key?: string): DocumentComponent | ValuePrimitive | undefined {
        if (key === undefined) {
            return this.value;
        }
        return super.get(key);
    }
}
