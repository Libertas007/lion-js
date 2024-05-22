"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifySchema = exports.analyzeSchema = exports.parseSchemaOrNull = exports.parseSchema = exports.parseTextOrNull = exports.analyzeText = exports.stringifyDocument = exports.parseText = void 0;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
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
    const doc = parser.parse();
    if (doc.hasSchema) {
        doc.schema.validate(doc.doc, false, false);
    }
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
function parseSchema(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.SchemaParser(lexer.process());
    const schema = parser.parse();
    errors_1.errors.process();
    errors_1.errors.errors = [];
    return schema;
}
exports.parseSchema = parseSchema;
function parseSchemaOrNull(text) {
    try {
        return parseSchema(text);
    }
    catch (e) {
        return null;
    }
}
exports.parseSchemaOrNull = parseSchemaOrNull;
function analyzeSchema(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.SchemaParser(lexer.process());
    parser.parse();
    const final = errors_1.errors.errors;
    errors_1.errors.errors = [];
    return final;
}
exports.analyzeSchema = analyzeSchema;
function stringifySchema(schema) {
    return schema.stringify();
}
exports.stringifySchema = stringifySchema;
