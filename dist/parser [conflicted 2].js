"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaParser = exports.Parser = void 0;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
const schema_1 = require("./schema");
const types_1 = require("./types");
class Parser {
    constructor(tokens) {
        this.finish = false;
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
        const doc = new types_1.DocumentComponent();
        this.expect(lexer_1.TokenType.LBRACE);
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.RBRACE) {
            const [key, value] = this.parsePair();
            if (this.finish) {
                return doc;
            }
            doc.set(key, value);
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
            return new types_1.DocumentComponent(this.currentToken.value);
        }
        else if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.INTEGER) {
            return new types_1.DocumentComponent(parseInt(((_c = this.currentToken.value) === null || _c === void 0 ? void 0 : _c.toString()) || ""));
        }
        else if (((_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.type) === lexer_1.TokenType.FLOAT) {
            return new types_1.DocumentComponent(parseFloat(((_e = this.currentToken.value) === null || _e === void 0 ? void 0 : _e.toString()) || ""));
        }
        else if (((_f = this.currentToken) === null || _f === void 0 ? void 0 : _f.type) === lexer_1.TokenType.BOOLEAN) {
            return new types_1.DocumentComponent(this.currentToken.value === "true");
        }
        else if (((_g = this.currentToken) === null || _g === void 0 ? void 0 : _g.type) === lexer_1.TokenType.LBRACKET) {
            return this.parseArray();
        }
        else if (((_h = this.currentToken) === null || _h === void 0 ? void 0 : _h.type) === lexer_1.TokenType.LBRACE) {
            return this.parseDoc();
        }
        return new types_1.DocumentComponent();
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
        return types_1.DocumentComponent.fromArray(array);
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
        if (!this.currentToken) {
            errors_1.errors.addError(new errors_1.LionError(`Expected token type to be ${type} (got EOF)`, new lexer_1.Region(0, 0, 0, 0)));
            this.finish = true;
            return "";
        }
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === type) {
            if (value && this.currentToken.value !== value) {
                errors_1.errors.addError(new errors_1.LionError(`Expected value to be ${value} (got ${this.currentToken.value})`, this.currentToken.region));
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();
            return val;
        }
        else {
            errors_1.errors.addError(new errors_1.LionError(`Expected token type to be ${type} (got ${(_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type})`, (_d = (_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.region) !== null && _d !== void 0 ? _d : new lexer_1.Region(0, 0, 0, 0)));
            this.advance();
            return "";
        }
    }
}
exports.Parser = Parser;
class SchemaParser {
    constructor(tokens) {
        this.finish = false;
        this.tokens = tokens;
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }
    parse() {
        var _a;
        this.expect(lexer_1.TokenType.MODIFIER, "@definition");
        const schema = this.parseSchema();
        console.log({ schema });
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.EOF) {
            this.expect(lexer_1.TokenType.MODIFIER, "@subschema");
            const name = this.expect(lexer_1.TokenType.IDENTIFIER);
            const subSchema = this.parseSchema();
            console.log({ subSchema });
            schema_1.TypeRegistry.instance.registerType(name, subSchema.toTypeCheck());
            this.advance();
        }
        return schema;
    }
    parseSchema() {
        var _a, _b;
        this.expect(lexer_1.TokenType.LBRACE);
        const schema = new schema_1.Schema();
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.RBRACE &&
            ((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) !== lexer_1.TokenType.EOF) {
            const [key, value] = this.parsePair();
            schema.addComponent(key, value);
            // console.log({ key, value });
        }
        return schema;
    }
    parsePair() {
        var _a;
        const key = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.value;
        this.expect(lexer_1.TokenType.IDENTIFIER);
        this.expect(lexer_1.TokenType.COLON);
        const value = this.parseType();
        this.advance();
        return [(key === null || key === void 0 ? void 0 : key.toString()) || "", new schema_1.SchemaComponent(value)];
    }
    parseType() {
        var _a, _b, _c, _d;
        let type = "";
        type += this.expect(lexer_1.TokenType.IDENTIFIER);
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.COMMA &&
            ((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) !== lexer_1.TokenType.EOF &&
            this.currentToken) {
            console.log(this.currentToken);
            if (((_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.type) === lexer_1.TokenType.OF_TYPE_START ||
                ((_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.type) === lexer_1.TokenType.OF_TYPE_END) {
                type += this.currentToken.value;
                this.advance();
                continue;
            }
            type += this.expect(lexer_1.TokenType.IDENTIFIER);
            this.advance();
        }
        return type;
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
        if (!this.currentToken) {
            errors_1.errors.addError(new errors_1.LionError(`Expected token type to be ${type} (got EOF)`, new lexer_1.Region(0, 0, 0, 0)));
            this.finish = true;
            return "";
        }
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === type) {
            if (value && this.currentToken.value !== value) {
                errors_1.errors.addError(new errors_1.LionError(`Expected value to be ${value} (got ${this.currentToken.value})`, this.currentToken.region));
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();
            return val;
        }
        else {
            errors_1.errors.addError(new errors_1.LionError(`Expected token type to be ${type} (got ${(_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type})`, (_d = (_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.region) !== null && _d !== void 0 ? _d : new lexer_1.Region(0, 0, 0, 0)));
            this.advance();
            return "";
        }
    }
}
exports.SchemaParser = SchemaParser;
