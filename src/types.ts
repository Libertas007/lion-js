export type ValuePrimitive = number | string | boolean;

export class LionDocument {
    public doc: DocumentComponent;

    constructor(document: DocumentComponent) {
        this.doc = document;
    }

    public get(key: string) {
        return this.doc.get(key);
    }

    public set(key: string, value: ValuePrimitive) {
        this.doc.set(key, new DocumentComponent(value));
    }

    public stringify() {
        let text = "@doc {\n";
        this.doc.forEach((value, key) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });

        return text + "}";
    }

    private stringifyValue(value: ValuePrimitive | any): string {
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

    private stringifyObject(obj: Object | DocumentComponent): string {
        let text = "{\n";
        if (obj instanceof DocumentComponent) {
            obj.forEach((value, key) => {
                text += `  ${key}: ${this.stringifyValue(value)},\n`;
            });
        } else {
            Object.entries(obj).forEach(([key, value]) => {
                text += `  ${key}: ${this.stringifyValue(value)},\n`;
            });
        }
        text += "}";

        return text;
    }
}

export class DocumentComponent extends Map<string, DocumentComponent> {
    private value?: ValuePrimitive;
    public isArray = false;

    constructor(value?: ValuePrimitive) {
        super();
        this.value = value;
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

    public get(): ValuePrimitive;
    public get(key: string): DocumentComponent | undefined;
    public get(key?: string): DocumentComponent | ValuePrimitive | undefined {
        if (key === undefined) {
            return this.value;
        }
        return super.get(key);
    }
}
