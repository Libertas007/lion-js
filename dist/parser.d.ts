import { Token } from "./lexer";
import { LionDocument } from "./types";
export declare class Parser {
    tokens: Token[];
    private pos;
    private currentToken;
    constructor(tokens: Token[]);
    parse(): LionDocument;
    private parseSchema;
    private parseDoc;
    private parsePair;
    private parseValue;
    private parseArray;
    private advance;
    private unadvance;
    private expect;
}
