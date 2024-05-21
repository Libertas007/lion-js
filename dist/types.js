"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentComponent = exports.LionDocument = void 0;
class LionDocument {
    constructor(document) {
        this.doc = document;
    }
    get(key) {
        return this.doc.get(key);
    }
    set(key, value) {
        this.doc.set(key, new DocumentComponent(value));
    }
    stringify() {
        let text = "@doc {\n";
        this.doc.forEach((value, key) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });
        return text + "}";
    }
    stringifyValue(value) {
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
    stringifyObject(obj) {
        let text = "{\n";
        if (obj instanceof DocumentComponent) {
            obj.forEach((value, key) => {
                text += `  ${key}: ${this.stringifyValue(value)},\n`;
            });
        }
        else {
            Object.entries(obj).forEach(([key, value]) => {
                text += `  ${key}: ${this.stringifyValue(value)},\n`;
            });
        }
        text += "}";
        return text;
    }
}
exports.LionDocument = LionDocument;
class DocumentComponent extends Map {
    constructor(value) {
        super();
        this.isArray = false;
        this.value = value;
    }
    isSingleValue() {
        return this.size === 0 && this.value !== undefined;
    }
    static fromArray(array) {
        const doc = new DocumentComponent();
        array.forEach((value, index) => doc.set(index.toString(), value));
        doc.isArray = true;
        return doc;
    }
    get(key) {
        if (key === undefined) {
            return this.value;
        }
        return super.get(key);
    }
}
exports.DocumentComponent = DocumentComponent;
