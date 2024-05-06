import { LionError, errors } from "./errors";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { LionDocument } from "./types";

export function parseText(text: string): LionDocument {
    const lexer = new Lexer(text);

    const parser = new Parser(lexer.process());

    const doc = parser.parse();

    errors.process();

    errors.errors = [];

    return doc;
}

export function stringifyDocument(doc: LionDocument): string {
    return doc.stringify();
}

export function analyzeText(text: string): LionError[] {
    const lexer = new Lexer(text);

    const parser = new Parser(lexer.process());

    parser.parse();

    const final = errors.errors;

    errors.errors = [];

    return final;
}

export function parseTextOrNull(text: string): LionDocument | null {
    try {
        return parseText(text);
    } catch (e) {
        return null;
    }
}
