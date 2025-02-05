"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsingContext = exports.LionErrorList = exports.LionError = void 0;
const schema_1 = require("./schema");
/**
 * Represents an error specific to the Lion format.
 *
 * @remarks
 * This class is used to encapsulate error details including a message,
 * the region where the error occurred, and an optional description.
 *
 *
 * @public
 */
class LionError {
    constructor(message, region, description) {
        this.description = "";
        this.message = message;
        this.region = region;
        this.description = description || "";
    }
    toString() {
        if (this.description) {
            return `${this.message} at ${this.region.startLine}:${this.region.startCol}\n${this.description}`;
        }
        return `${this.message} at ${this.region.startLine}:${this.region.startCol}`;
    }
    process() {
        throw new Error(this.toString());
    }
}
exports.LionError = LionError;
class LionErrorList {
    constructor(errors, processWhenAdded) {
        this.processWhenAdded = false;
        this.errors = errors || [];
        this.processWhenAdded = processWhenAdded || false;
    }
    addError(error) {
        this.errors.push(error);
        if (this.processWhenAdded) {
            this.process();
        }
    }
    toString() {
        return this.errors.map((error) => error.toString()).join("\n");
    }
    process() {
        if (this.errors.length > 0) {
            throw new Error(this.toString());
        }
    }
}
exports.LionErrorList = LionErrorList;
class ParsingContext {
    constructor(errors, typeRegistry) {
        this.errors = errors !== null && errors !== void 0 ? errors : new LionErrorList();
        this.typeRegistry = typeRegistry !== null && typeRegistry !== void 0 ? typeRegistry : new schema_1.TypeRegistry(this.errors);
    }
}
exports.ParsingContext = ParsingContext;
