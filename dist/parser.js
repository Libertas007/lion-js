"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const lexer_1 = require("./lexer");
const types_1 = require("./types");
class Parser {
    constructor(tokens) {
        this.tokens = tokens.filter((token) => token.type !== lexer_1.TokenType.COMMA);
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }
    parse() {
        var _a, _b;
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.MODIFIER &&
            this.currentToken.value === "@schema") {
            const schema = this.parseSchema();
        }
        if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.MODIFIER &&
            this.currentToken.value === "@doc") {
            this.advance();
            const doc = this.parseDoc();
            return new types_1.LionDocument(doc);
        }
        else {
            const doc = this.parseDoc();
            return new types_1.LionDocument(doc);
        }
    }
    parseSchema() {
        var _a;
        this.expect(lexer_1.TokenType.MODIFIER, "@schema");
        const schema = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.value;
        this.expect(lexer_1.TokenType.STRING);
        return schema;
    }
    parseDoc() {
        var _a;
        const doc = {};
        this.expect(lexer_1.TokenType.LBRACE);
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.RBRACE) {
            const [key, value] = this.parsePair();
            doc[key] = value;
        }
        this.expect(lexer_1.TokenType.RBRACE);
        this.unadvance();
        return doc;
    }
    parsePair() {
        var _a;
        const key = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.value;
        this.expect(lexer_1.TokenType.IDENTIFIER);
        this.expect(lexer_1.TokenType.COLON);
        const value = this.parseValue();
        this.advance();
        return [(key === null || key === void 0 ? void 0 : key.toString()) || "", value];
    }
    parseValue() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.STRING) {
            return this.currentToken.value;
        }
        else if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.INTEGER) {
            return parseInt(((_c = this.currentToken.value) === null || _c === void 0 ? void 0 : _c.toString()) || "");
        }
        else if (((_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.type) === lexer_1.TokenType.FLOAT) {
            return parseFloat(((_e = this.currentToken.value) === null || _e === void 0 ? void 0 : _e.toString()) || "");
        }
        else if (((_f = this.currentToken) === null || _f === void 0 ? void 0 : _f.type) === lexer_1.TokenType.BOOLEAN) {
            return this.currentToken.value === "true";
        }
        else if (((_g = this.currentToken) === null || _g === void 0 ? void 0 : _g.type) === lexer_1.TokenType.LBRACKET) {
            return this.parseArray();
        }
        else if (((_h = this.currentToken) === null || _h === void 0 ? void 0 : _h.type) === lexer_1.TokenType.LBRACE) {
            return this.parseDoc();
        }
        return "";
    }
    parseArray() {
        var _a;
        const array = [];
        this.expect(lexer_1.TokenType.LBRACKET);
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.RBRACKET) {
            const value = this.parseValue();
            array.push(value);
            this.advance();
        }
        this.expect(lexer_1.TokenType.RBRACKET);
        this.unadvance();
        return array;
    }
    advance() {
        this.pos += 1;
        if (this.pos > this.tokens.length - 1) {
            this.currentToken = null;
        }
        else {
            this.currentToken = this.tokens[this.pos];
        }
    }
    unadvance() {
        this.pos -= 1;
        this.currentToken = this.tokens[this.pos];
    }
    expect(type, value) {
        var _a, _b, _c, _d;
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === type) {
            if (value && this.currentToken.value !== value) {
                throw new Error(`Expected value to be ${value} (got ${this.currentToken.value}), region: ${this.currentToken.region}`);
            }
            let val = this.currentToken.value;
            this.advance();
            return val;
        }
        else {
            throw new Error(`Expected token type to be ${type} (got ${(_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type}), value: ${(_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.value}, region: ${(_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.region}`);
        }
    }
}
exports.Parser = Parser;
