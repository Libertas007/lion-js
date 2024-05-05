import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { LionDocument } from "./types";

export function parseText(text: string): LionDocument {
    const lexer = new Lexer(text);

    const parser = new Parser(lexer.process());

    return parser.parse();
}

export function stringifyDocument(doc: LionDocument): string {
    return doc.stringify();
}
