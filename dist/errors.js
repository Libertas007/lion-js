"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.LionError = void 0;
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
exports.errors = new LionErrorList();
