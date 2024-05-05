export type LionValue =
    | number
    | string
    | boolean
    | LionValue[]
    | DocumentPrimitive;

export type DocumentPrimitive = { [key: string]: LionValue };

export class LionDocument {
    public doc: DocumentPrimitive;

    constructor(document: DocumentPrimitive) {
        this.doc = document;
    }

    public get(key: string) {
        return this.doc[key];
    }

    public set(key: string, value: LionValue) {
        this.doc[key] = value;
    }

    public stringify() {
        let text = "@doc {\n";
        Object.entries(this.doc).forEach(([key, value]) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });

        return text + "}";
    }

    private stringifyValue(value: LionValue | any): string {
        if (Array.isArray(value)) {
            return `[${value.map((e) => this.stringifyValue(e)).join(", ")}]`;
        }

        if (typeof value === "object") {
            return this.stringifyObject(value);
        }

        if (typeof value === "string") {
            return `"${value}"`;
        }

        return value.toString();
    }

    private stringifyObject(obj: Object | DocumentPrimitive): string {
        let text = "{\n";
        Object.entries(obj).forEach(([key, value]) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });
        text += "}";
        return text;
    }
}
