"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextOrNull = exports.analyzeText = exports.stringifyDocument = exports.parseText = void 0;
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
