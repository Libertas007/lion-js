import { LionValue } from "./types";
export declare class Lexer {
    text: string;
    private pos;
    private line;
    private col;
    private currentChar;
    private tokens;
    constructor(text: string);
    process(): Token[];
    private skipWhitespace;
    private advance;
}
export declare class Token {
    type: TokenType;
    value: LionValue;
    region: Region;
    constructor(type: TokenType, value: LionValue, region: Region);
}
export declare class Region {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    constructor(startLine: number, endLine: number, startCol: number, endCol: number);
    toString(): string;
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
    MODIFIER = "MODIFIER"
}
