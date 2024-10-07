"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifySchema = exports.analyzeSchema = exports.parseSchemaOrNull = exports.parseSchema = exports.parseTextOrNull = exports.analyzeText = exports.stringifyDocument = exports.parseText = void 0;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
__exportStar(require("./types"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./schema"), exports);
/**
 * Parses the given text and returns a LionDocument.
 *
 * @param text - The text to be parsed.
 * @returns The parsed LionDocument.
 *
 * @throws Will throw an error if the document schema validation fails.
 */
function parseText(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.Parser(lexer.process());
    const doc = parser.parse();
    if (doc.hasSchema) {
        doc.schema.validate(doc.doc, true, true);
    }
    errors_1.errors.process();
    errors_1.errors.errors = [];
    return doc;
}
exports.parseText = parseText;
/**
 * Converts a LionDocument object to its string representation.
 *
 * @param doc - The LionDocument instance to be stringified.
 * @returns The string representation of the provided LionDocument.
 */
function stringifyDocument(doc) {
    return doc.stringify();
}
exports.stringifyDocument = stringifyDocument;
/**
 * Analyzes the given text and returns an array of LionError objects.
 *
 * @param text - The text to be analyzed.
 * @returns An array of LionError objects containing the analysis results.
 */
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
/**
 * Parses the given text into a `LionDocument` object. If parsing fails, returns `null`.
 *
 * @param text - The text to be parsed.
 * @returns A `LionDocument` object if parsing is successful, otherwise `null`.
 */
function parseTextOrNull(text) {
    try {
        return parseText(text);
    }
    catch (e) {
        return null;
    }
}
exports.parseTextOrNull = parseTextOrNull;
/**
 * Parses a given schema text and returns a Schema object.
 *
 * @param text - The schema text to be parsed.
 * @returns The parsed Schema object.
 */
function parseSchema(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.SchemaParser(lexer.process());
    const schema = parser.parse();
    errors_1.errors.process();
    errors_1.errors.errors = [];
    return schema;
}
exports.parseSchema = parseSchema;
/**
 * Parses the given text into a Schema object. If parsing fails, returns null.
 *
 * @param text - The string representation of the schema to be parsed.
 * @returns The parsed Schema object, or null if parsing fails.
 */
function parseSchemaOrNull(text) {
    try {
        return parseSchema(text);
    }
    catch (e) {
        return null;
    }
}
exports.parseSchemaOrNull = parseSchemaOrNull;
/**
 * Analyzes the provided schema text and returns an array of LionError objects.
 *
 * This function processes the input text using a lexer and a schema parser,
 * then parses the schema and collects any errors encountered during parsing.
 * The collected errors are returned as an array of LionError objects.
 *
 * @param text - The schema text to be analyzed.
 * @returns An array of LionError objects representing the errors found during schema analysis.
 */
function analyzeSchema(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.SchemaParser(lexer.process());
    parser.parse();
    const final = errors_1.errors.errors;
    errors_1.errors.errors = [];
    return final;
}
exports.analyzeSchema = analyzeSchema;
/**
 * Converts a given schema object into its string representation.
 *
 * @param schema - The schema object to be stringified.
 * @returns The string representation of the schema.
 */
function stringifySchema(schema) {
    return schema.stringify();
}
exports.stringifySchema = stringifySchema;
