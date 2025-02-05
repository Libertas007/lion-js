import { ParsingContext } from "./context";
import { ValuePrimitive } from "./types";
export declare class Lexer {
    text: string;
    private pos;
    private line;
    private col;
    private currentChar;
    private tokens;
    context: ParsingContext;
    constructor(text: string, context: ParsingContext);
    process(): Token[];
    private skipWhitespace;
    private advance;
}
export declare class Token {
    type: TokenType;
    value: ValuePrimitive;
    region: Region;
    constructor(type: TokenType, value: ValuePrimitive, region: Region);
}
export declare class Region {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    constructor(startLine: number, endLine: number, startCol: number, endCol: number);
    toString(): string;
    combine(region: Region): Region;
}
export declare enum TokenType {
    INTEGER = "INTEGER",
    FLOAT = "FLOAT",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    LBRACKET = "LBRACKET",
    RBRACKET = "RBRACKET",
    LBRACE = "LBRACE",
    RBRACE = "RBRACE",
    COLON = "COLON",
    COMMA = "COMMA",
    IDENTIFIER = "IDENTIFIER",
    MODIFIER = "MODIFIER",
    OF_TYPE_START = "OF_TYPE_START",
    OF_TYPE_END = "OF_TYPE_END",
    EOF = "EOF",
    OPTIONAL_PROPERTY = "OPTIONAL_PROPERTY"
}
