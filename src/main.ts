import { LionError, errors } from "./errors";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Schema, SchemaComponent, TypeRegistry } from "./schema";
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

const text = `
@doc {
    title: "My Document",
    description: "This is a document",
    version: 1,
    example: [{
        name: "John Doe",
        age: 30,
        isStudent: true,
        grades: [100, 90, 80],
    }],
    test: [[1, 2, 3], [4, 5, 6]],
}
`;

const schema = new Schema();
schema.addComponent("title", new SchemaComponent("String"));
schema.addComponent("description", new SchemaComponent("String"));
schema.addComponent("version", new SchemaComponent("Number"));
schema.addComponent("test", new SchemaComponent("Array<Array<Integer>>"));
const userSchema = new Schema();
userSchema.addComponent("name", new SchemaComponent("String"));
userSchema.addComponent("age", new SchemaComponent("Number"));
userSchema.addComponent("isStudent", new SchemaComponent("Boolean"));
userSchema.addComponent("grades", new SchemaComponent("Array<Integer>"));

TypeRegistry.instance.registerType("User", userSchema.toTypeCheck());

schema.addComponent("example", new SchemaComponent("Array<User>"));

const doc = parseText(text);
console.log(schema.validate(doc.doc));
