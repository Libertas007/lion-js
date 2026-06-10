import { LionError, ParsingContext } from "./context";
import { Lexer, Region } from "./lexer";
import { Parser, SchemaParser } from "./parser";
import { BlankSchema, Schema } from "./schema";
import { DocumentComponent, LionDocument } from "./types";

export * from "./types";
export * from "./context";
export * from "./schema";
export { Region } from "./lexer";

interface IODrivers {
    readFile?: (path: string) => Promise<string>;
    fetchUrl?: (url: string) => Promise<string>;
}

const io: IODrivers = {
    fetchUrl:
        typeof fetch === "function"
            ? async (url: string) => (await fetch(url)).text()
            : undefined,
};

export function __registerIO(drivers: IODrivers) {
    Object.assign(io, drivers);
}

function isUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parses the given text and returns a LionDocument.
 *
 * @param text - The text to be parsed.
 * @returns The parsed LionDocument.
 *
 * @throws Will throw an error if the document schema validation fails.
 */
export async function parseText(text: string): Promise<LionDocument> {
    const context = new ParsingContext();

    const lexer = new Lexer(text, context);

    const parser = new Parser(lexer.process(), context);

    const doc = parser.parse();

    if (doc.schema instanceof BlankSchema) {
        try {
            const schemaText = isUrl(doc.schema.url)
                ? await io.fetchUrl?.(doc.schema.url)
                : await io.readFile?.(doc.schema.url);

            if (schemaText === undefined) {
                context.errors.errors.push(
                    new LionError(
                        `No IO driver registered to fetch schema from ${doc.schema.url}`,
                        doc.schema.region || new Region(0, 0, 0, 0),
                    ),
                );
                doc.hasSchema = false;
            } else {
                doc.schema = parseSchema(schemaText);
            }
        } catch (e) {
            context.errors.errors.push(
                new LionError(
                    `Failed to load schema from ${(doc.schema as BlankSchema).url}: ${e instanceof Error ? e.message : String(e)}`,
                    doc.schema.region || new Region(0, 0, 0, 0),
                ),
            );

            doc.hasSchema = false;
        }
    }

    if (doc.hasSchema) {
        const errorList = doc.schema.validate(doc.doc, true, true);
        context.errors.errors.push(...errorList.errors);
    }

    context.errors.process();

    return doc;
}

/**
 * Converts a LionDocument object to its string representation.
 *
 * @param doc - The LionDocument instance to be stringified.
 * @returns The string representation of the provided LionDocument.
 */
export function stringifyDocument(doc: LionDocument): string {
    return doc.stringify();
}

/**
 * Analyzes the given text and returns an array of LionError objects.
 *
 * @param text - The text to be analyzed.
 * @returns An array of LionError objects containing the analysis results.
 */
export async function analyzeText(text: string): Promise<LionError[]> {
    const context = new ParsingContext();

    const lexer = new Lexer(text, context);

    const parser = new Parser(lexer.process(), context);

    const doc = parser.parse();

    if (doc.schema instanceof BlankSchema) {
        try {
            const schemaText = isUrl(doc.schema.url)
                ? await io.fetchUrl?.(doc.schema.url)
                : await io.readFile?.(doc.schema.url);

            if (schemaText === undefined) {
                context.errors.errors.push(
                    new LionError(
                        `No IO driver registered to fetch schema from ${doc.schema.url}`,
                        doc.schema.region || new Region(0, 0, 0, 0),
                    ),
                );
                doc.hasSchema = false;
            } else {
                doc.schema = parseSchema(schemaText);
            }
        } catch (e) {
            context.errors.errors.push(
                new LionError(
                    `Failed to load schema from ${(doc.schema as BlankSchema).url}: ${e instanceof Error ? e.message : String(e)}`,
                    doc.schema.region || new Region(0, 0, 0, 0),
                ),
            );

            doc.hasSchema = false;
        }
    }

    if (doc.hasSchema) {
        const errorList = doc.schema.validate(doc.doc, false, false);
        context.errors.errors.push(...errorList.errors);
    }

    return context.errors.errors;
}

/**
 * Parses the given text into a `LionDocument` object. If parsing fails, returns `null`.
 *
 * @param text - The text to be parsed.
 * @returns A `LionDocument` object if parsing is successful, otherwise `null`.
 */
export async function parseTextOrNull(
    text: string,
): Promise<LionDocument | null> {
    try {
        return await parseText(text);
    } catch (e) {
        return null;
    }
}

/**
 * Parses a given schema text and returns a Schema object.
 *
 * @param text - The schema text to be parsed.
 * @returns The parsed Schema object.
 */
export function parseSchema(text: string): Schema {
    const context = new ParsingContext();

    const lexer = new Lexer(text, context);

    const parser = new SchemaParser(lexer.process(), context);

    const schema = parser.parse();

    context.errors.process();

    return schema;
}

/**
 * Parses the given text into a Schema object. If parsing fails, returns null.
 *
 * @param text - The string representation of the schema to be parsed.
 * @returns The parsed Schema object, or null if parsing fails.
 */
export function parseSchemaOrNull(text: string): Schema | null {
    try {
        return parseSchema(text);
    } catch (e) {
        return null;
    }
}

/**
 * Analyzes the provided schema text and returns an array of LionError objects.
 *
 * This function processes the input text using a lexer and a schema parser,
 * then parses the schema and collects any errors encountered during parsing.
 * The collected errors are returned as an array of LionError objects.
 *
 * @param text - The schema text to be analyzed.
 * @returns An array of LionError objects representing the errors found during schema analysis.
 */
export function analyzeSchema(text: string): LionError[] {
    const context = new ParsingContext();

    const lexer = new Lexer(text, context);

    const parser = new SchemaParser(lexer.process(), context);

    parser.parse();

    return context.errors.errors;
}

/**
 * Converts a given schema object into its string representation.
 *
 * @param schema - The schema object to be stringified.
 * @returns The string representation of the schema.
 */
export function stringifySchema(schema: Schema): string {
    return schema.stringify();
}
