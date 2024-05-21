"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextOrNull = exports.analyzeText = exports.stringifyDocument = exports.parseText = void 0;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const schema_1 = require("./schema");
function parseText(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.Parser(lexer.process());
    const doc = parser.parse();
    errors_1.errors.process();
    errors_1.errors.errors = [];
    return doc;
}
exports.parseText = parseText;
function stringifyDocument(doc) {
    return doc.stringify();
}
exports.stringifyDocument = stringifyDocument;
function analyzeText(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.Parser(lexer.process());
    parser.parse();
    const final = errors_1.errors.errors;
    errors_1.errors.errors = [];
    return final;
}
exports.analyzeText = analyzeText;
function parseTextOrNull(text) {
    try {
        return parseText(text);
    }
    catch (e) {
        return null;
    }
}
exports.parseTextOrNull = parseTextOrNull;
const text = `
@doc {
    title: "My Document",
    description: "This is a document",
    version: 1,
    example: [{
        name: "John Doe",
        age: 30,
        isStudent: true,
        grades: [100, 90, 80],
    }],
    test: [[1, 2, 3], [4, 5, 6]],
}
`;
const schema = new schema_1.Schema();
schema.addComponent("title", new schema_1.SchemaComponent("String"));
schema.addComponent("description", new schema_1.SchemaComponent("String"));
schema.addComponent("version", new schema_1.SchemaComponent("Number"));
schema.addComponent("test", new schema_1.SchemaComponent("Array<Array<Integer>>"));
const userSchema = new schema_1.Schema();
userSchema.addComponent("name", new schema_1.SchemaComponent("String"));
userSchema.addComponent("age", new schema_1.SchemaComponent("Number"));
userSchema.addComponent("isStudent", new schema_1.SchemaComponent("Boolean"));
userSchema.addComponent("grades", new schema_1.SchemaComponent("Array<Integer>"));
schema_1.TypeRegistry.instance.registerType("User", userSchema.toTypeCheck());
schema.addComponent("example", new schema_1.SchemaComponent("Array<User>"));
const doc = parseText(text);
console.log(schema.validate(doc.doc));
