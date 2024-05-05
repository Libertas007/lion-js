"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LionDocument = void 0;
class LionDocument {
    constructor(document) {
        this.doc = document;
    }
    get(key) {
        return this.doc[key];
    }
    set(key, value) {
        this.doc[key] = value;
    }
    stringify() {
        let text = "@doc {\n";
        Object.entries(this.doc).forEach(([key, value]) => {
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
        Object.entries(obj).forEach(([key, value]) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });
        text += "}";
        return text;
    }
}
exports.LionDocument = LionDocument;
