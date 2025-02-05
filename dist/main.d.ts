import { LionError } from "./context";
import { Schema } from "./schema";
import { LionDocument } from "./types";
export * from "./types";
export * from "./context";
export * from "./schema";
/**
 * Parses the given text and returns a LionDocument.
 *
 * @param text - The text to be parsed.
 * @returns The parsed LionDocument.
 *
 * @throws Will throw an error if the document schema validation fails.
 */
export declare function parseText(text: string): LionDocument;
/**
 * Converts a LionDocument object to its string representation.
 *
 * @param doc - The LionDocument instance to be stringified.
 * @returns The string representation of the provided LionDocument.
 */
export declare function stringifyDocument(doc: LionDocument): string;
/**
 * Analyzes the given text and returns an array of LionError objects.
 *
 * @param text - The text to be analyzed.
 * @returns An array of LionError objects containing the analysis results.
 */
export declare function analyzeText(text: string): LionError[];
/**
 * Parses the given text into a `LionDocument` object. If parsing fails, returns `null`.
 *
 * @param text - The text to be parsed.
 * @returns A `LionDocument` object if parsing is successful, otherwise `null`.
 */
export declare function parseTextOrNull(text: string): LionDocument | null;
/**
 * Parses a given schema text and returns a Schema object.
 *
 * @param text - The schema text to be parsed.
 * @returns The parsed Schema object.
 */
export declare function parseSchema(text: string): Schema;
/**
 * Parses the given text into a Schema object. If parsing fails, returns null.
 *
 * @param text - The string representation of the schema to be parsed.
 * @returns The parsed Schema object, or null if parsing fails.
 */
export declare function parseSchemaOrNull(text: string): Schema | null;
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
export declare function analyzeSchema(text: string): LionError[];
/**
 * Converts a given schema object into its string representation.
 *
 * @param schema - The schema object to be stringified.
 * @returns The string representation of the schema.
 */
export declare function stringifySchema(schema: Schema): string;
