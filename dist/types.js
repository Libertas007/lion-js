"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentComponent = exports.LionDocument = void 0;
const schema_1 = require("./schema");
/**
 * Represents a Lion document.
 */
class LionDocument {
    constructor(context, document, schema) {
        this.hasSchema = false;
        this.context = context;
        this.doc = document;
        this.schema = schema || new schema_1.Schema(this.context);
        this.hasSchema = schema !== undefined;
    }
    get(key) {
        return this.doc.get(key);
    }
    set(key, value) {
        this.doc.set(key, new DocumentComponent(value));
    }
    validate(silent = true) {
        return this.schema.validate(this.doc, !silent, true);
    }
    stringify() {
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
    stringifyValue(value) {
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
    stringifyObject(obj) {
        let text = "{\n";
        obj.forEach((value, key) => {
            text += `  ${key}: ${this.stringifyValue(value)},\n`;
        });
        text += "}";
        return text;
    }
}
exports.LionDocument = LionDocument;
/**
 * Represents a document component that can hold a primitive value or a collection of other document components.
 * Extends the Map class to allow hierarchical structuring of document components.
 *
 * @class DocumentComponent
 * @extends {Map<string, DocumentComponent>}
 */
class DocumentComponent extends Map {
    constructor(value, region) {
        super();
        this.isArray = false;
        this.value = value;
        this.region = region;
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
    toArray() {
        return Array.from(this.values());
    }
    get(key) {
        if (key === undefined) {
            return this.value || this;
        }
        if (this.isArray) {
            return this.toArray();
        }
        return super.get(key);
    }
}
exports.DocumentComponent = DocumentComponent;
