import { LionError, errors } from "./errors";
import { Region, Token, TokenType } from "./lexer";
import { DocumentComponent, LionDocument, ValuePrimitive } from "./types";

export class Parser {
    public tokens: Token[];
    private pos: number;
    private currentToken: Token | null;

    private finish: boolean = false;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter((token) => token.type !== TokenType.COMMA);
        this.pos = 0;
        this.currentToken = this.tokens[this.pos];
    }

    public parse(): LionDocument {
        if (
            this.currentToken?.type === TokenType.MODIFIER &&
            this.currentToken.value === "@schema"
        ) {
            const schema = this.parseSchema();
        }

        if (
            this.currentToken?.type === TokenType.MODIFIER &&
            this.currentToken.value === "@doc"
        ) {
            this.advance();
            const doc = this.parseDoc();
            return new LionDocument(doc);
        } else {
            const doc = this.parseDoc();
            return new LionDocument(doc);
        }
    }

    private parseSchema() {
        this.expect(TokenType.MODIFIER, "@schema");
        const schema = this.currentToken?.value;
        this.expect(TokenType.STRING);
        return schema;
    }

    private parseDoc(): DocumentComponent {
        const doc = new DocumentComponent();
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
        return doc;
    }

    private parsePair(): [string, DocumentComponent] {
        const key = this.currentToken?.value;
        this.expect(TokenType.IDENTIFIER);
        this.expect(TokenType.COLON);
        const value = this.parseValue();
        this.advance();
        return [key?.toString() || "", value];
    }

    private parseValue(): DocumentComponent {
        if (this.currentToken?.type === TokenType.STRING) {
            return new DocumentComponent(this.currentToken.value);
        } else if (this.currentToken?.type === TokenType.INTEGER) {
            return new DocumentComponent(
                parseInt(this.currentToken.value?.toString() || "")
            );
        } else if (this.currentToken?.type === TokenType.FLOAT) {
            return new DocumentComponent(
                parseFloat(this.currentToken.value?.toString() || "")
            );
        } else if (this.currentToken?.type === TokenType.BOOLEAN) {
            return new DocumentComponent(this.currentToken.value === "true");
        } else if (this.currentToken?.type === TokenType.LBRACKET) {
            return this.parseArray();
        } else if (this.currentToken?.type === TokenType.LBRACE) {
            return this.parseDoc();
        }

        return new DocumentComponent();
    }

    private parseArray(): DocumentComponent {
        const array: DocumentComponent[] = [];
        this.expect(TokenType.LBRACKET);
        while (this.currentToken?.type !== TokenType.RBRACKET) {
            const value = this.parseValue();
            array.push(value);
            this.advance();
        }

        this.expect(TokenType.RBRACKET);
        this.unadvance();
        return DocumentComponent.fromArray(array);
    }

    private advance() {
        this.pos += 1;
        if (this.pos > this.tokens.length - 1) {
            this.currentToken = null;
        } else {
            this.currentToken = this.tokens[this.pos];
        }
    }

    private unadvance() {
        this.pos -= 1;
        this.currentToken = this.tokens[this.pos];
    }

    private expect(type: TokenType, value?: ValuePrimitive): ValuePrimitive {
        if (!this.currentToken) {
            errors.addError(
                new LionError(
                    `Expected token type to be ${type} (got EOF)`,
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
                        `Expected value to be ${value} (got ${this.currentToken.value})`,
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
                    `Expected token type to be ${type} (got ${this.currentToken?.type})`,
                    this.currentToken?.region ?? new Region(0, 0, 0, 0)
                )
            );
            this.advance();
            return "";
        }
    }
}
