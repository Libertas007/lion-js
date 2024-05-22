import { Token, TokenType } from "./lexer";
import { Schema } from "./schema";
import { LionDocument, ValuePrimitive } from "./types";
export declare class Parser {
    tokens: Token[];
    protected pos: number;
    protected currentToken: Token | null;
    protected finish: boolean;
    constructor(tokens: Token[]);
    parse(): LionDocument;
    private parseSchema;
    private parseDoc;
    private parsePair;
    private parseValue;
    private parseArray;
    protected advance(): void;
    protected unadvance(): void;
    protected expect(type: TokenType, value?: ValuePrimitive): ValuePrimitive;
}
export declare class SchemaParser {
    tokens: Token[];
    protected pos: number;
    protected currentToken: Token | null;
    protected finish: boolean;
    constructor(tokens: Token[]);
    parse(): Schema;
    private parseSchema;
    private parsePair;
    private parseType;
    protected advance(): void;
    protected unadvance(): void;
    protected expect(type: TokenType, value?: ValuePrimitive): ValuePrimitive;
}
