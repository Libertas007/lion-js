import { LionError, errors } from "./errors";
import { Lexer } from "./lexer";
import { Parser, SchemaParser } from "./parser";
import { Schema } from "./schema";
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

    const doc = parser.parse();

    if (doc.hasSchema) {
        doc.schema.validate(doc.doc, false, false);
    }

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

export function parseSchema(text: string): Schema {
    const lexer = new Lexer(text);

    const parser = new SchemaParser(lexer.process());

    const schema = parser.parse();

    errors.process();

    errors.errors = [];

    return schema;
}

export function parseSchemaOrNull(text: string): Schema | null {
    try {
        return parseSchema(text);
    } catch (e) {
        return null;
    }
}

export function analyzeSchema(text: string): LionError[] {
    const lexer = new Lexer(text);

    const parser = new SchemaParser(lexer.process());

    parser.parse();

    const final = errors.errors;

    errors.errors = [];

    return final;
}

export function stringifySchema(schema: Schema): string {
    return schema.stringify();
}
