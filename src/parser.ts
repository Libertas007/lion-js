import { LionError, errors } from "./errors";
import { Region, Token, TokenType } from "./lexer";
import { Schema, SchemaComponent, TypeRegistry } from "./schema";
import { DocumentComponent, LionDocument, ValuePrimitive } from "./types";

export class Parser {
    public tokens: Token[];
    protected pos: number;
    protected currentToken: Token | null;

    protected finish: boolean = false;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }

    public parse(): LionDocument {
        let schema = new Schema();
        let hasSchema = false;
        if (
            this.currentToken?.type === TokenType.MODIFIER &&
            this.currentToken.value === "@schema"
        ) {
            schema = this.parseSchema();
            hasSchema = true;
        }

        if (
            this.currentToken?.type === TokenType.MODIFIER &&
            this.currentToken.value === "@doc"
        ) {
            this.expect(TokenType.MODIFIER, "@doc");
            const doc = this.parseDoc();
            if (hasSchema) {
                return new LionDocument(doc, schema);
            }
            return new LionDocument(doc);
        } else {
            const doc = this.parseDoc();
            if (hasSchema) {
                return new LionDocument(doc, schema);
            }
            return new LionDocument(doc);
        }
    }

    private parseSchema(): Schema {
        this.expect(TokenType.MODIFIER, "@schema");
        if (this.currentToken?.type === TokenType.STRING) {
            console.warn("Schema by name is not supported yet");
            return new Schema();
        }

        this.expect(TokenType.LBRACE);

        const schemaEnd = this.tokens.findIndex(
            (token) =>
                token.type === TokenType.MODIFIER && token.value === "@doc"
        );

        const parser = new SchemaParser([
            ...this.tokens.slice(this.pos, schemaEnd - 1),
            new Token(TokenType.EOF, "", new Region(0, 0, 0, 0)),
        ]);
        const schema = parser.parse();

        this.pos = schemaEnd - 1;
        this.advance();
        return schema;
    }

    private parseDoc(): DocumentComponent {
        const doc = new DocumentComponent();
        const start = this.currentToken?.region;
        this.expect(TokenType.LBRACE);
        while (this.currentToken?.type !== TokenType.RBRACE) {
            const [key, value] = this.parsePair();
            if (this.finish) {
                return doc;
            }

            doc.set(key, value);
        }

        this.expect(TokenType.RBRACE);
        this.unadvance();
        doc.region = start?.combine(
            this.currentToken?.region || new Region(0, 0, 0, 0)
        );
        return doc;
    }

    private parsePair(): [string, DocumentComponent] {
        const key = this.currentToken?.value;
        this.expect(TokenType.IDENTIFIER);
        this.expect(TokenType.COLON);
        const value = this.parseValue();
        this.advance();
        if (this.currentToken?.type === TokenType.COMMA) {
            this.advance();
        }
        return [key?.toString() || "", value];
    }

    private parseValue(): DocumentComponent {
        if (this.currentToken?.type === TokenType.STRING) {
            return new DocumentComponent(
                this.currentToken.value,
                this.currentToken.region
            );
        } else if (this.currentToken?.type === TokenType.INTEGER) {
            return new DocumentComponent(
                parseInt(this.currentToken.value?.toString() || ""),
                this.currentToken.region
            );
        } else if (this.currentToken?.type === TokenType.FLOAT) {
            return new DocumentComponent(
                parseFloat(this.currentToken.value?.toString() || ""),
                this.currentToken.region
            );
        } else if (this.currentToken?.type === TokenType.BOOLEAN) {
            return new DocumentComponent(
                this.currentToken.value === "true",
                this.currentToken.region
            );
        } else if (this.currentToken?.type === TokenType.LBRACKET) {
            return this.parseArray();
        } else if (this.currentToken?.type === TokenType.LBRACE) {
            return this.parseDoc();
        }

        return new DocumentComponent();
    }

    private parseArray(): DocumentComponent {
        const array: DocumentComponent[] = [];
        const start = this.currentToken?.region;
        this.expect(TokenType.LBRACKET);
        while (this.currentToken?.type !== TokenType.RBRACKET) {
            const value = this.parseValue();
            array.push(value);
            this.advance();
            if (this.currentToken?.type === TokenType.COMMA) {
                this.advance();
            }
        }

        this.expect(TokenType.RBRACKET);
        this.unadvance();
        const region = start?.combine(
            this.currentToken?.region || new Region(0, 0, 0, 0)
        );
        const component = DocumentComponent.fromArray(array);
        component.region = region;
        return component;
    }

    protected advance() {
        this.pos += 1;
        if (this.pos > this.tokens.length - 1) {
            this.currentToken = null;
        } else {
            this.currentToken = this.tokens[this.pos];
        }
    }

    protected unadvance() {
        this.pos -= 1;
        this.currentToken = this.tokens[this.pos];
    }

    protected expect(type: TokenType, value?: ValuePrimitive): ValuePrimitive {
        if (!this.currentToken) {
            errors.addError(
                new LionError(
                    `Expected the token type to be '${type}' (got EOF).`,
                    new Region(0, 0, 0, 0)
                )
            );
            this.finish = true;
            return "";
        }

        if (this.currentToken?.type === type) {
            if (value && this.currentToken.value !== value) {
                errors.addError(
                    new LionError(
                        `Expected the value to be '${value}' (got ${this.currentToken.value}).`,
                        this.currentToken.region
                    )
                );
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();

            return val;
        } else {
            errors.addError(
                new LionError(
                    `Expected the token type to be '${type}' (got ${this.currentToken?.type}).`,
                    this.currentToken?.region ?? new Region(0, 0, 0, 0)
                )
            );
            this.advance();
            return "";
        }
    }
}

export class SchemaParser {
    public tokens: Token[];
    protected pos: number;
    protected currentToken: Token;

    protected finish: boolean = false;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }

    public parse(): Schema {
        this.expect(TokenType.MODIFIER, "@definition");
        const schema = this.parseSchema();

        while (this.currentToken?.type !== TokenType.EOF) {
            this.expect(TokenType.MODIFIER, "@subschema");
            const name = this.expect(TokenType.IDENTIFIER) as string;
            const subSchema = this.parseSchema();

            TypeRegistry.instance.registerType(name, subSchema.toTypeCheck());
            TypeRegistry.instance.registerSubSchema(name, subSchema);
        }
        return schema;
    }

    private parseSchema(): Schema {
        this.expect(TokenType.LBRACE);
        const schema = new Schema();
        while (
            this.currentToken?.type !== TokenType.RBRACE &&
            this.currentToken?.type !== TokenType.EOF
        ) {
            const [key, value] = this.parsePair();
            schema.addComponent(key, value);
        }
        this.expect(TokenType.RBRACE);
        return schema;
    }

    private parsePair(): [string, SchemaComponent] {
        const key = this.currentToken?.value;
        this.expect(TokenType.IDENTIFIER);
        this.expect(TokenType.COLON);
        const value = this.parseType();
        this.advance();
        return [key?.toString() || "", new SchemaComponent(value)];
    }

    private parseType(): string {
        let type = "";
        type += this.expect(TokenType.IDENTIFIER);
        if (this.currentToken?.type === TokenType.OF_TYPE_START) {
            type += this.expect(TokenType.OF_TYPE_START);
            type += this.parseType();
            type += this.expect(TokenType.OF_TYPE_END);
        }

        return type;
    }

    protected advance() {
        this.pos += 1;
        if (this.pos > this.tokens.length - 1) {
            this.currentToken = new Token(
                TokenType.EOF,
                "",
                new Region(0, 0, 0, 0)
            );
        } else {
            this.currentToken = this.tokens[this.pos];
        }
    }

    protected unadvance() {
        this.pos -= 1;
        this.currentToken = this.tokens[this.pos];
    }

    protected expect(type: TokenType, value?: ValuePrimitive): ValuePrimitive {
        if (!this.currentToken) {
            errors.addError(
                new LionError(
                    `Expected the token type to be '${type}' (got EOF).`,
                    new Region(0, 0, 0, 0)
                )
            );
            this.finish = true;
            return "";
        }

        if (this.currentToken?.type === type) {
            if (value && this.currentToken.value !== value) {
                errors.addError(
                    new LionError(
                        `Expected the value to be '${value}' (got ${this.currentToken.value}).`,
                        this.currentToken.region
                    )
                );
                this.advance();
                return "";
            }
            let val = this.currentToken.value;
            this.advance();

            return val;
        } else {
            errors.addError(
                new LionError(
                    `Expected the token type to be '${type}' (got ${this.currentToken?.type}).`,
                    this.currentToken?.region ?? new Region(0, 0, 0, 0)
                )
            );
            this.advance();
            return "";
        }
    }
}
