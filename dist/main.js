"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyDocument = exports.parseText = void 0;
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
function parseText(text) {
    const lexer = new lexer_1.Lexer(text);
    const parser = new parser_1.Parser(lexer.process());
    return parser.parse();
}
exports.parseText = parseText;
function stringifyDocument(doc) {
    return doc.stringify();
}
exports.stringifyDocument = stringifyDocument;
