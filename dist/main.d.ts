import { LionError } from "./errors";
import { LionDocument } from "./types";
export declare function parseText(text: string): LionDocument;
export declare function stringifyDocument(doc: LionDocument): string;
export declare function analyzeText(text: string): LionError[];
export declare function parseTextOrNull(text: string): LionDocument | null;
