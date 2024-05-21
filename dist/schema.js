"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeRegistry = exports.Schema = exports.SchemaComponent = void 0;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
class SchemaComponent {
    constructor(type) {
        this.type = type;
    }
    validate(value) {
        return TypeRegistry.instance.validateType(this.type, value);
    }
}
exports.SchemaComponent = SchemaComponent;
class Schema {
    constructor() {
        this.components = new Map();
    }
    addComponent(name, component) {
        this.components.set(name, component);
    }
    validate(value) {
        if (value.isSingleValue())
            return false;
        if (value.size !== this.components.size)
            return false;
        for (const [key, component] of this.components) {
            if (!value.has(key)) {
                console.log("Missing key", key);
                return false;
            }
            if (!component.validate(value.get(key))) {
                console.log("Invalid key", key);
                // console.log(component, value.get(key));
                return false;
            }
        }
        return true;
    }
    toTypeCheck() {
        return (value) => {
            if (value.isSingleValue())
                return false;
            return this.validate(value);
        };
    }
}
exports.Schema = Schema;
class TypeRegistry {
    constructor() {
        this.types = new Map();
    }
    registerType(name, check) {
        this.types.set(name, check);
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
            errors_1.errors.addError(new errors_1.LionError(`Type ${typeName} does not exist`, new lexer_1.Region(0, 0, 0, 0)));
        }
        return this.types.get(typeName);
    }
    validateType(type, value) {
        // console.log("================================start");
        // console.log({ type, value });
        const [typeName, of] = this.extractType(type);
        if (!this.hasType(typeName)) {
            errors_1.errors.addError(new errors_1.LionError(`Type ${typeName} does not exist`, new lexer_1.Region(0, 0, 0, 0)));
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
TypeRegistry.instance = new TypeRegistry();
TypeRegistry.instance.registerType("String", (value) => value.isSingleValue() && typeof value.get() === "string");
TypeRegistry.instance.registerType("Number", (value) => value.isSingleValue() && typeof value.get() === "number");
TypeRegistry.instance.registerType("Integer", (value) => value.isSingleValue() &&
    typeof value.get() === "number" &&
    Number.isInteger(value.get()));
TypeRegistry.instance.registerType("Float", (value) => value.isSingleValue() &&
    typeof value.get() === "number" &&
    !Number.isInteger(value.get()));
TypeRegistry.instance.registerType("Boolean", (value) => value.isSingleValue() && typeof value.get() === "boolean");
TypeRegistry.instance.registerType("Array", (value, of) => value.isArray &&
    (of ? Array.from(value.values()).every((v) => of(v)) : true));
