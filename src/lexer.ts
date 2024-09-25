import { LionError, errors } from "./errors";
import { ValuePrimitive } from "./types";

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class Lexer {
    public text: string;
    private pos: number = 0;
    private line: number = 1;
    private col: number = 1;
    private currentChar: string | null = null;
    private tokens: Token[] = [];

    constructor(text: string) {
        this.text = text;
        this.currentChar = text[0];
    }

    public process(): Token[] {
        while (this.currentChar !== null) {
            if (this.currentChar === " ") {
                this.skipWhitespace();
                continue;
            }
            if (this.currentChar === "\n") {
                this.line += 1;
                this.col = 1;
            }
            if (this.currentChar === "\r") {
                this.col = 1;
            }
            if (this.currentChar === "\t") {
                this.col += 4;
            }
            if (this.currentChar === "{") {
                this.tokens.push(
                    new Token(
                        TokenType.LBRACE,
                        "{",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === "}") {
                this.tokens.push(
                    new Token(
                        TokenType.RBRACE,
                        "}",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === "[") {
                this.tokens.push(
                    new Token(
                        TokenType.LBRACKET,
                        "[",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === "]") {
                this.tokens.push(
                    new Token(
                        TokenType.RBRACKET,
                        "]",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === "<") {
                this.tokens.push(
                    new Token(
                        TokenType.OF_TYPE_START,
                        "<",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === ">") {
                this.tokens.push(
                    new Token(
                        TokenType.OF_TYPE_END,
                        ">",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === ":") {
                this.tokens.push(
                    new Token(
                        TokenType.COLON,
                        ":",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === ",") {
                this.tokens.push(
                    new Token(
                        TokenType.COMMA,
                        ",",
                        new Region(this.line, this.line, this.col, this.col)
                    )
                );
                this.advance();
                continue;
            }
            if (this.currentChar === '"') {
                const startCol = this.col;
                const startLine = this.line;

                this.advance();
                let value = "";
                while (this.currentChar !== '"') {
                    value += this.currentChar;
                    this.advance();
                }
                this.advance();
                this.tokens.push(
                    new Token(
                        TokenType.STRING,
                        value,
                        new Region(startLine, this.line, startCol, this.col)
                    )
                );
                continue;
            }
            if (
                this.currentChar === "t" &&
                this.text.slice(this.pos, this.pos + 4) === "true"
            ) {
                this.tokens.push(
                    new Token(
                        TokenType.BOOLEAN,
                        true,
                        new Region(this.line, this.line, this.col - 4, this.col)
                    )
                );
                this.pos += 3;
                this.advance();
                continue;
            }
            if (
                this.currentChar === "f" &&
                this.text.slice(this.pos, this.pos + 5) === "false"
            ) {
                this.tokens.push(
                    new Token(
                        TokenType.BOOLEAN,
                        false,
                        new Region(this.line, this.line, this.col - 5, this.col)
                    )
                );
                this.pos += 4;
                this.advance();
                continue;
            }

            if (
                this.currentChar === "0" ||
                (parseInt(this.currentChar, 10) >= 0 &&
                    parseInt(this.currentChar, 10) <= 9)
            ) {
                const startCol = this.col;
                const startLine = this.line;

                let value = "";
                let isFloat = false;
                let containsLetter = false;

                while (
                    !Number.isNaN(parseInt(this.currentChar, 10)) ||
                    this.currentChar === "." ||
                    this.currentChar === "b" ||
                    this.currentChar === "x" ||
                    this.currentChar === "o"
                ) {
                    if (
                        (isFloat || containsLetter) &&
                        this.currentChar === "."
                    ) {
                        errors.addError(
                            new LionError(
                                "Invalid float.",
                                new Region(
                                    this.line,
                                    this.line,
                                    this.col,
                                    this.col
                                ),
                                containsLetter
                                    ? "A number marked as binary, hexadecimal or octal cannot contain a decimal point."
                                    : "Multiple decimal points in a number. Try removing one."
                            )
                        );
                        return this.tokens;
                    }

                    if (
                        (containsLetter || isFloat) &&
                        letters.includes(this.currentChar)
                    ) {
                        errors.addError(
                            new LionError(
                                "Invalid number.",
                                new Region(
                                    this.line,
                                    this.line,
                                    this.col,
                                    this.col
                                ),
                                'Number contains letters. Numbers cannot contain letters except for prefixes "0x", "0b" and "0o".'
                            )
                        );
                        return this.tokens;
                    }

                    if (this.currentChar === ".") {
                        isFloat = true;
                    }

                    if (letters.includes(this.currentChar)) {
                        containsLetter = true;
                    }
                    value += this.currentChar;
                    this.advance();
                }

                if (value.includes("b")) {
                    this.tokens.push(
                        new Token(
                            TokenType.INTEGER,
                            parseInt(value.replace("b", ""), 2),
                            new Region(startLine, this.line, startCol, this.col)
                        )
                    );
                    continue;
                }
                if (value.includes("x")) {
                    this.tokens.push(
                        new Token(
                            TokenType.INTEGER,
                            parseInt(value.replace("x", ""), 16),
                            new Region(startLine, this.line, startCol, this.col)
                        )
                    );
                    continue;
                }

                if (value.includes("o")) {
                    this.tokens.push(
                        new Token(
                            TokenType.INTEGER,
                            parseInt(value.replace("o", ""), 8),
                            new Region(startLine, this.line, startCol, this.col)
                        )
                    );
                    continue;
                }

                if (value.includes(".")) {
                    this.tokens.push(
                        new Token(
                            TokenType.FLOAT,
                            parseFloat(value),
                            new Region(startLine, this.line, startCol, this.col)
                        )
                    );
                    continue;
                }

                this.tokens.push(
                    new Token(
                        TokenType.INTEGER,
                        parseInt(value, 10),
                        new Region(startLine, this.line, startCol, this.col)
                    )
                );
                continue;
            }

            if (letters.includes(this.currentChar)) {
                const startCol = this.col;
                const startLine = this.line;
                let value = "";
                while (letters.includes(this.currentChar)) {
                    value += this.currentChar;
                    this.advance();
                }
                this.tokens.push(
                    new Token(
                        TokenType.IDENTIFIER,
                        value,
                        new Region(startLine, this.line, startCol, this.col)
                    )
                );
                continue;
            }

            if (this.currentChar === "@") {
                const startCol = this.col;
                const startLine = this.line;
                this.advance();
                let value = "@";
                while (letters.includes(this.currentChar)) {
                    value += this.currentChar;
                    this.advance();
                }
                this.tokens.push(
                    new Token(
                        TokenType.MODIFIER,
                        value,
                        new Region(startLine, this.line, startCol, this.col)
                    )
                );
                continue;
            }

            this.advance();
        }

        this.tokens.push(
            new Token(
                TokenType.EOF,
                "",
                new Region(this.line, this.line, this.col, this.col)
            )
        );
        return this.tokens;
    }

    private skipWhitespace() {
        while (this.currentChar === " ") {
            this.advance();
        }
    }

    private advance() {
        this.pos += 1;
        if (this.pos > this.text.length - 1) {
            this.currentChar = null;
        } else {
            this.currentChar = this.text[this.pos];
            this.col += 1;
        }
    }
}

export class Token {
    public type: TokenType;
    public value: ValuePrimitive;
    public region: Region;

    constructor(type: TokenType, value: ValuePrimitive, region: Region) {
        this.type = type;
        this.value = value;
        this.region = region;
    }
}

export class Region {
    public startLine: number;
    public endLine: number;
    public startCol: number;
    public endCol: number;

    constructor(
        startLine: number,
        endLine: number,
        startCol: number,
        endCol: number
    ) {
        this.startLine = startLine;
        this.endLine = endLine;
        this.startCol = startCol;
        this.endCol = endCol;
    }

    public toString(): string {
        return `(${this.startLine}, ${this.startCol}) - (${this.endLine}, ${this.endCol})`;
    }

    public combine(region: Region): Region {
        return new Region(
            Math.min(this.startLine, region.startLine),
            Math.max(this.endLine, region.endLine),
            Math.min(this.startCol, region.startCol),
            Math.max(this.endCol, region.endCol)
        );
    }
}

export enum TokenType {
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
}
