"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeRegistry = exports.Schema = exports.SchemaComponent = void 0;
const context_1 = require("./context");
const lexer_1 = require("./lexer");
/**
 * Represents a schema component that can validate a document component against a specified type.
 */
class SchemaComponent {
    constructor(type, isOptional = false, context) {
        this.type = type;
        this.isOptional = isOptional;
        this.context = context;
    }
    validate(value) {
        return this.context.typeRegistry.validateType(this.type, value);
    }
}
exports.SchemaComponent = SchemaComponent;
/**
 * Represents a schema.
 */
class Schema {
    constructor(context) {
        this.context = context;
        this.components = new Map();
    }
    addComponent(name, component) {
        this.components.set(name, component);
    }
    validate(value, process = false, clear = true) {
        var _a, _b;
        if (value.isSingleValue()) {
            this.context.errors.addError(new context_1.LionError(`Expected an object, got a single value.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
        }
        if (value.size <
            Array.from(this.components.values()).filter((x) => !x.isOptional).length ||
            value.size > this.components.size) {
            const nonOptional = Array.from(this.components.values()).filter((x) => !x.isOptional).length;
            this.context.errors.addError(new context_1.LionError(nonOptional !== this.components.size
                ? `Expected ${nonOptional}-${this.components.size} keys, got ${value.size}.`
                : `Expected ${this.components.size} keys, got ${value.size}.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
        }
        let differentKeys = Array.from(value.keys()).filter((x) => !this.components.has(x));
        for (const key of differentKeys) {
            this.context.errors.addError(new context_1.LionError(`Unexpected key '${key}'.`, ((_a = value.get(key)) === null || _a === void 0 ? void 0 : _a.region) || new lexer_1.Region(0, 0, 0, 0)));
        }
        for (const [key, component] of this.components) {
            if (!value.has(key) && !component.isOptional) {
                this.context.errors.addError(new context_1.LionError(`Expected key '${key}' to be present.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
                continue;
            }
            if (value.has(key) &&
                !component.validate(value.get(key))) {
                this.context.errors.addError(new context_1.LionError(`Expected key '${key}' to satisfy the constrains of type '${component.type}'.`, ((_b = value.get(key)) === null || _b === void 0 ? void 0 : _b.region) || new lexer_1.Region(0, 0, 0, 0)));
            }
        }
        if (this.context.errors.errors.length > 0) {
            return false;
        }
        this.context.errors.errors = [];
        return true;
    }
    toTypeCheck() {
        return (value) => {
            if (value.isSingleValue())
                return false;
            return this.validate(value);
        };
    }
    stringify() {
        return `@definition {
${Array.from(this.components)
            .map(([key, value]) => `\t${key}: ${value.type}`)
            .join(",\n")}
}
        
${Array.from(this.context.typeRegistry.subSchemas)
            .map(([key, value]) => value.stringifyAsSubSchema(key))
            .join("\n")}
`;
    }
    stringifyAsSubSchema(name) {
        return `@subschema ${name} {
${Array.from(this.components)
            .map(([key, value]) => `\t${key}: ${value.type}`)
            .join(",\n")}
}       
        `;
    }
}
exports.Schema = Schema;
/**
 * The `TypeRegistry` class is a singleton that manages the registration and validation of types and schemas.
 * It provides methods to register types and sub-schemas, retrieve types, and validate values against types.
 *
 * @remarks
 * This class is designed to be used as a singleton, with the single instance accessible via `TypeRegistry.instance`.
 *
 * @example
 * ```typescript
 * // Register a type
 * this.registerType('MyType', myTypeCheckFunction);
 *
 * // Register a sub-schema
 * this.registerSubSchema('MySchema', mySchema);
 *
 * // Validate a value against a type
 * const isValid = this.validateType('MyType', myValue);
 * ```
 */
class TypeRegistry {
    constructor(errors) {
        this.types = new Map();
        this.subSchemas = new Map();
        this.errors = errors;
        this.loadBuiltInTypes();
    }
    loadBuiltInTypes() {
        this.registerType("String", (value) => value.isSingleValue() && typeof value.get() === "string");
        this.registerType("Number", (value) => value.isSingleValue() && typeof value.get() === "number");
        this.registerType("Integer", (value) => value.isSingleValue() &&
            typeof value.get() === "number" &&
            Number.isInteger(value.get()));
        this.registerType("Float", (value) => value.isSingleValue() &&
            typeof value.get() === "number" &&
            !Number.isInteger(value.get()));
        this.registerType("Boolean", (value) => value.isSingleValue() && typeof value.get() === "boolean");
        this.registerType("Array", (value, of) => value.isArray &&
            (of ? Array.from(value.values()).every((v) => of(v)) : true));
        this.registerType("Any", (value) => true);
    }
    registerType(name, check) {
        this.types.set(name, check);
    }
    registerSubSchema(name, schema) {
        this.subSchemas.set(name, schema);
    }
    getTypeOrNull(type) {
        const [typeName, of] = this.extractType(type);
        return this.types.get(typeName) || null;
    }
    hasType(type) {
        return this.types.has(type);
    }
    getType(type) {
        const [typeName, of] = this.extractType(type);
        if (!this.hasType(typeName)) {
            this.errors.addError(new context_1.LionError(`Type '${typeName}' does not exist.`, new lexer_1.Region(0, 0, 0, 0)));
        }
        return this.types.get(typeName);
    }
    validateType(type, value) {
        // console.log("================================start");
        // console.log({ type, value });
        const [typeName, of] = this.extractType(type);
        if (!this.hasType(typeName)) {
            this.errors.addError(new context_1.LionError(`Type '${typeName}' does not exist.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
            return false;
        }
        const check = this.getType(typeName);
        const val = check(value, of ? this.getType(of) : undefined);
        // console.log({ value, typeName, of, val, check });
        // console.log("================================end");
        return val;
    }
    extractType(type) {
        const match = /(\w+)<([\w<>]+)>/g.exec(type);
        return match && match[2] ? [match[1], match[2]] : [type];
    }
}
exports.TypeRegistry = TypeRegistry;
