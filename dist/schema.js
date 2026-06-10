"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeRegistry = exports.BlankSchema = exports.Schema = exports.MultipleSchemaComponent = exports.SchemaComponent = void 0;
const context_1 = require("./context");
const lexer_1 = require("./lexer");
/**
 * Represents a schema component that can validate a document component against a specified type.
 */
class SchemaComponent {
    constructor(type, isOptional = false, context, of) {
        this.type = type;
        this.isOptional = isOptional;
        this.context = context;
        this.of = of;
    }
    validate(value) {
        return this.context.typeRegistry.validateType(this, value);
    }
    toString() {
        return `${this.type}${this.of ? `<${this.of.toString()}>` : ""}${this.isOptional ? "?" : ""}`;
    }
}
exports.SchemaComponent = SchemaComponent;
class MultipleSchemaComponent extends SchemaComponent {
    constructor(types, isOptional = false, context) {
        super("", isOptional, context);
        this.types = types;
    }
    validate(value) {
        return this.types.some((type) => type.validate(value));
    }
    toString() {
        return (this.types.map((type) => type.toString()).join(" | ") +
            (this.isOptional ? "?" : ""));
    }
}
exports.MultipleSchemaComponent = MultipleSchemaComponent;
/**
 * Represents a schema.
 */
class Schema {
    constructor(context, region) {
        this.context = context;
        this.components = new Map();
        this.region = region;
    }
    addComponent(name, component) {
        this.components.set(name, component);
    }
    validate(value, process = false, clear = true) {
        var _a, _b;
        const errorList = new context_1.LionErrorList();
        if (value.isSingleValue()) {
            errorList.addError(new context_1.LionError(`Expected an object, got a single value.`, value.region || this.region || new lexer_1.Region(0, 0, 0, 0)));
        }
        if (value.size <
            Array.from(this.components.values()).filter((x) => !x.isOptional).length ||
            value.size > this.components.size) {
            const nonOptional = Array.from(this.components.values()).filter((x) => !x.isOptional).length;
            errorList.addError(new context_1.LionError(nonOptional !== this.components.size
                ? `Expected ${nonOptional}-${this.components.size} keys, got ${value.size}.`
                : `Expected ${this.components.size} keys, got ${value.size}.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
        }
        let differentKeys = Array.from(value.keys()).filter((x) => !this.components.has(x));
        for (const key of differentKeys) {
            errorList.addError(new context_1.LionError(`Unexpected key '${key}'.`, ((_a = value.get(key)) === null || _a === void 0 ? void 0 : _a.region) ||
                this.region ||
                new lexer_1.Region(0, 0, 0, 0)));
        }
        for (const [key, component] of this.components) {
            if (!value.has(key) && !component.isOptional) {
                errorList.addError(new context_1.LionError(`Expected key '${key}' to be present.`, value.region || this.region || new lexer_1.Region(0, 0, 0, 0)));
                continue;
            }
            if (value.has(key) &&
                !component.validate(value.get(key))) {
                errorList.addError(new context_1.LionError(`Expected key '${key}' to satisfy the constrains of type '${component.toString()}'.`, ((_b = value.get(key)) === null || _b === void 0 ? void 0 : _b.region) ||
                    this.region ||
                    new lexer_1.Region(0, 0, 0, 0)));
            }
        }
        if (errorList.errors.length > 0) {
            return errorList;
        }
        return new context_1.LionErrorList();
    }
    toTypeCheck() {
        return (value) => {
            if (value.isSingleValue())
                return false;
            return this.validate(value).errors.length === 0;
        };
    }
    stringify() {
        return `@definition {
${Array.from(this.components)
            .map(([key, value]) => `\t${key}: ${value.toString()}`)
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
            .map(([key, value]) => `\t${key}: ${value.toString()}`)
            .join(",\n")}
}       
        `;
    }
}
exports.Schema = Schema;
class BlankSchema extends Schema {
    constructor(context, url, region) {
        super(context, region);
        this.url = url;
    }
}
exports.BlankSchema = BlankSchema;
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
            (of
                ? Array.from(value.values()).every((v) => of.validate(v))
                : true));
        this.registerType("Any", (value) => true);
    }
    registerType(name, check) {
        this.types.set(name, check);
    }
    registerSubSchema(name, schema) {
        this.subSchemas.set(name, schema);
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
        const { type: typeName, of } = type;
        if (!this.hasType(typeName)) {
            this.errors.addError(new context_1.LionError(`Type '${type.toString()}' does not exist.`, value.region || new lexer_1.Region(0, 0, 0, 0)));
            return false;
        }
        const check = this.getType(typeName);
        const val = check(value, of);
        // console.log({ value, typeName, of, val, check });
        // console.log("================================end");
        return val;
    }
    extractType(type) {
        const match = /(\w+)<([\w|<>]+)>/g.exec(type);
        return match && match[2] ? [match[1], match[2]] : [type];
    }
}
exports.TypeRegistry = TypeRegistry;
