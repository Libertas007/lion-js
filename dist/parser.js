"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaParser = exports.Parser = void 0;
const context_1 = require("./context");
const lexer_1 = require("./lexer");
const schema_1 = require("./schema");
const types_1 = require("./types");
class Parser {
    constructor(tokens, context) {
        this.finish = false;
        this.tokens = tokens;
        this.context = context;
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }
    parse() {
        var _a, _b;
        let schema = new schema_1.Schema(this.context);
        let hasSchema = false;
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.MODIFIER &&
            this.currentToken.value === "@schema") {
            schema = this.parseSchema();
            hasSchema = true;
        }
        if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.MODIFIER &&
            this.currentToken.value === "@doc") {
            this.expect(lexer_1.TokenType.MODIFIER, "@doc");
            const doc = this.parseDoc();
            if (hasSchema) {
                return new types_1.LionDocument(this.context, doc, schema);
            }
            return new types_1.LionDocument(this.context, doc);
        }
        else {
            const doc = this.parseDoc();
            if (hasSchema) {
                return new types_1.LionDocument(this.context, doc, schema);
            }
            return new types_1.LionDocument(this.context, doc);
        }
    }
    parseSchema() {
        var _a;
        this.expect(lexer_1.TokenType.MODIFIER, "@schema");
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.STRING) {
            console.warn("Schema by name is not supported yet");
            return new schema_1.Schema(this.context);
        }
        this.expect(lexer_1.TokenType.LBRACE);
        const schemaEnd = this.tokens.findIndex((token) => token.type === lexer_1.TokenType.MODIFIER && token.value === "@doc");
        const parser = new SchemaParser([
            ...this.tokens.slice(this.pos, schemaEnd - 1),
            new lexer_1.Token(lexer_1.TokenType.EOF, "", new lexer_1.Region(0, 0, 0, 0)),
        ], this.context);
        const schema = parser.parse();
        this.pos = schemaEnd - 1;
        this.advance();
        return schema;
    }
    parseDoc() {
        var _a, _b, _c;
        const doc = new types_1.DocumentComponent();
        const start = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.region;
        this.expect(lexer_1.TokenType.LBRACE);
        while (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) !== lexer_1.TokenType.RBRACE) {
            const [key, value] = this.parsePair();
            if (this.finish) {
                return doc;
            }
            doc.set(key, value);
        }
        this.expect(lexer_1.TokenType.RBRACE);
        this.unadvance();
        doc.region = start === null || start === void 0 ? void 0 : start.combine(((_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.region) || new lexer_1.Region(0, 0, 0, 0));
        return doc;
    }
    parsePair() {
        var _a, _b;
        const key = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.value;
        this.expect(lexer_1.TokenType.IDENTIFIER);
        this.expect(lexer_1.TokenType.COLON);
        const value = this.parseValue();
        this.advance();
        if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.COMMA) {
            this.advance();
        }
        return [(key === null || key === void 0 ? void 0 : key.toString()) || "", value];
    }
    parseValue() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.STRING) {
            return new types_1.DocumentComponent(this.currentToken.value, this.currentToken.region);
        }
        else if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.INTEGER) {
            return new types_1.DocumentComponent(parseInt(((_c = this.currentToken.value) === null || _c === void 0 ? void 0 : _c.toString()) || ""), this.currentToken.region);
        }
        else if (((_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.type) === lexer_1.TokenType.FLOAT) {
            return new types_1.DocumentComponent(parseFloat(((_e = this.currentToken.value) === null || _e === void 0 ? void 0 : _e.toString()) || ""), this.currentToken.region);
        }
        else if (((_f = this.currentToken) === null || _f === void 0 ? void 0 : _f.type) === lexer_1.TokenType.BOOLEAN) {
            return new types_1.DocumentComponent(this.currentToken.value === "true", this.currentToken.region);
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
        var _a, _b, _c, _d;
        const array = [];
        const start = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.region;
        this.expect(lexer_1.TokenType.LBRACKET);
        while (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) !== lexer_1.TokenType.RBRACKET) {
            const value = this.parseValue();
            array.push(value);
            this.advance();
            if (((_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.type) === lexer_1.TokenType.COMMA) {
                this.advance();
            }
        }
        this.expect(lexer_1.TokenType.RBRACKET);
        this.unadvance();
        const region = start === null || start === void 0 ? void 0 : start.combine(((_d = this.currentToken) === null || _d === void 0 ? void 0 : _d.region) || new lexer_1.Region(0, 0, 0, 0));
        const component = types_1.DocumentComponent.fromArray(array);
        component.region = region;
        return component;
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
            this.context.errors.addError(new context_1.LionError(`Expected the token type to be '${type}' (got EOF).`, new lexer_1.Region(0, 0, 0, 0)));
            this.finish = true;
            return "";
        }
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === type) {
            if (value && this.currentToken.value !== value) {
                this.context.errors.addError(new context_1.LionError(`Expected the value to be '${value}' (got ${this.currentToken.value}).`, this.currentToken.region));
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();
            return val;
        }
        else {
            this.context.errors.addError(new context_1.LionError(`Expected the token type to be '${type}' (got ${(_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type}).`, (_d = (_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.region) !== null && _d !== void 0 ? _d : new lexer_1.Region(0, 0, 0, 0)));
            this.advance();
            return "";
        }
    }
}
exports.Parser = Parser;
class SchemaParser {
    constructor(tokens, context) {
        this.finish = false;
        this.tokens = tokens;
        this.context = context;
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }
    parse() {
        var _a;
        this.expect(lexer_1.TokenType.MODIFIER, "@definition");
        const schema = this.parseSchema();
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.EOF) {
            this.expect(lexer_1.TokenType.MODIFIER, "@subschema");
            const name = this.expect(lexer_1.TokenType.IDENTIFIER);
            const subSchema = this.parseSchema();
            this.context.typeRegistry.registerType(name, subSchema.toTypeCheck());
            this.context.typeRegistry.registerSubSchema(name, subSchema);
        }
        return schema;
    }
    parseSchema() {
        var _a, _b;
        this.expect(lexer_1.TokenType.LBRACE);
        const schema = new schema_1.Schema(this.context);
        while (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.RBRACE &&
            ((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) !== lexer_1.TokenType.EOF) {
            const [key, value] = this.parsePair();
            schema.addComponent(key, value);
        }
        this.expect(lexer_1.TokenType.RBRACE);
        return schema;
    }
    parsePair() {
        var _a, _b;
        const key = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.value;
        this.expect(lexer_1.TokenType.IDENTIFIER);
        let isOptional = false;
        if (((_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type) === lexer_1.TokenType.OPTIONAL_PROPERTY) {
            this.advance();
            isOptional = true;
        }
        this.expect(lexer_1.TokenType.COLON);
        const value = this.parseType();
        this.advance();
        return [
            (key === null || key === void 0 ? void 0 : key.toString()) || "",
            new schema_1.SchemaComponent(value, isOptional, this.context),
        ];
    }
    parseType() {
        var _a;
        let type = "";
        type += this.expect(lexer_1.TokenType.IDENTIFIER);
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === lexer_1.TokenType.OF_TYPE_START) {
            type += this.expect(lexer_1.TokenType.OF_TYPE_START);
            type += this.parseType();
            type += this.expect(lexer_1.TokenType.OF_TYPE_END);
        }
        return type;
    }
    advance() {
        this.pos += 1;
        if (this.pos > this.tokens.length - 1) {
            this.currentToken = new lexer_1.Token(lexer_1.TokenType.EOF, "", new lexer_1.Region(0, 0, 0, 0));
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
            this.context.errors.addError(new context_1.LionError(`Expected the token type to be '${type}' (got EOF).`, new lexer_1.Region(0, 0, 0, 0)));
            this.finish = true;
            return "";
        }
        if (((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) === type) {
            if (value && this.currentToken.value !== value) {
                this.context.errors.addError(new context_1.LionError(`Expected the value to be '${value}' (got ${this.currentToken.value}).`, this.currentToken.region));
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();
            return val;
        }
        else {
            this.context.errors.addError(new context_1.LionError(`Expected the token type to be '${type}' (got ${(_b = this.currentToken) === null || _b === void 0 ? void 0 : _b.type}).`, (_d = (_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.region) !== null && _d !== void 0 ? _d : new lexer_1.Region(0, 0, 0, 0)));
            this.advance();
            return "";
        }
    }
}
exports.SchemaParser = SchemaParser;
