import { LionError, LionErrorList, ParsingContext } from "./context";
import { Region } from "./lexer";
import { DocumentComponent } from "./types";

/**
 * Represents a schema component that can validate a document component against a specified type.
 */
export class SchemaComponent {
    // Multiple types => OR condition
    public type: string;
    public of?: SchemaComponent;
    public context: ParsingContext;
    public isOptional: boolean;

    constructor(
        type: string,
        isOptional: boolean = false,
        context: ParsingContext,
        of?: SchemaComponent,
    ) {
        this.type = type;
        this.isOptional = isOptional;
        this.context = context;
        this.of = of;
    }

    public validate(value: DocumentComponent): boolean {
        return this.context.typeRegistry.validateType(this, value);
    }

    public toString(): string {
        return `${this.type}${this.of ? `<${this.of.toString()}>` : ""}${this.isOptional ? "?" : ""}`;
    }
}

export class MultipleSchemaComponent extends SchemaComponent {
    public types: SchemaComponent[];

    constructor(
        types: SchemaComponent[],
        isOptional: boolean = false,
        context: ParsingContext,
    ) {
        super("", isOptional, context);
        this.types = types;
    }

    override validate(value: DocumentComponent): boolean {
        return this.types.some((type) => type.validate(value));
    }

    override toString(): string {
        return (
            this.types.map((type) => type.toString()).join(" | ") +
            (this.isOptional ? "?" : "")
        );
    }
}

/**
 * Represents a schema.
 */
export class Schema {
    public components: Map<string, SchemaComponent>;
    public context: ParsingContext;

    constructor(context: ParsingContext) {
        this.context = context;
        this.components = new Map();
    }

    public addComponent(name: string, component: SchemaComponent) {
        this.components.set(name, component);
    }

    public validate(
        value: DocumentComponent,
        process: boolean = false,
        clear: boolean = true,
    ): LionErrorList {
        const errorList = new LionErrorList();

        if (value.isSingleValue()) {
            errorList.addError(
                new LionError(
                    `Expected an object, got a single value.`,
                    value.region || new Region(0, 0, 0, 0),
                ),
            );
        }
        if (
            value.size <
                Array.from(this.components.values()).filter(
                    (x) => !x.isOptional,
                ).length ||
            value.size > this.components.size
        ) {
            const nonOptional = Array.from(this.components.values()).filter(
                (x) => !x.isOptional,
            ).length;

            errorList.addError(
                new LionError(
                    nonOptional !== this.components.size
                        ? `Expected ${nonOptional}-${this.components.size} keys, got ${value.size}.`
                        : `Expected ${this.components.size} keys, got ${value.size}.`,
                    value.region || new Region(0, 0, 0, 0),
                ),
            );
        }

        let differentKeys = Array.from(value.keys()).filter(
            (x) => !this.components.has(x),
        );

        for (const key of differentKeys) {
            errorList.addError(
                new LionError(
                    `Unexpected key '${key}'.`,
                    value.get(key)?.region || new Region(0, 0, 0, 0),
                ),
            );
        }

        for (const [key, component] of this.components) {
            if (!value.has(key) && !component.isOptional) {
                errorList.addError(
                    new LionError(
                        `Expected key '${key}' to be present.`,
                        value.region || new Region(0, 0, 0, 0),
                    ),
                );
                continue;
            }

            if (
                value.has(key) &&
                !component.validate(value.get(key) as DocumentComponent)
            ) {
                errorList.addError(
                    new LionError(
                        `Expected key '${key}' to satisfy the constrains of type '${component.toString()}'.`,
                        value.get(key)?.region || new Region(0, 0, 0, 0),
                    ),
                );
            }
        }

        if (errorList.errors.length > 0) {
            return errorList;
        }

        return new LionErrorList();
    }

    public toTypeCheck(): TypeCheck {
        return (value: DocumentComponent) => {
            if (value.isSingleValue()) return false;
            return this.validate(value).errors.length === 0;
        };
    }

    public stringify(): string {
        return `@definition {
${Array.from(this.components)
    .map(([key, value]) => `\t${key}: ${value.toString()}`)
    .join(",\n")}
}
        
${Array.from(this.context.typeRegistry.subSchemas)
    .map(([key, value]) => value.stringifyAsSubSchema(key))
    .join("\n")}
`;
    }

    public stringifyAsSubSchema(name: string): string {
        return `@subschema ${name} {
${Array.from(this.components)
    .map(([key, value]) => `\t${key}: ${value.toString()}`)
    .join(",\n")}
}       
        `;
    }
}

export class BlankSchema extends Schema {
    public url: string;

    constructor(context: ParsingContext, url: string) {
        super(context);
        this.url = url;
    }
}

/**
 * The `TypeRegistry` class is a singleton that manages the registration and validation of types and schemas.
 * It provides methods to register types and sub-schemas, retrieve types, and validate values against types.
 *
 * @remarks
 * This class is designed to be used as a singleton, with the single instance accessible via `TypeRegistry.instance`.
 *
 * @example
 * ```typescript
 * // Register a type
 * this.registerType('MyType', myTypeCheckFunction);
 *
 * // Register a sub-schema
 * this.registerSubSchema('MySchema', mySchema);
 *
 * // Validate a value against a type
 * const isValid = this.validateType('MyType', myValue);
 * ```
 */
export class TypeRegistry {
    public types: Map<string, TypeCheck>;
    public subSchemas: Map<string, Schema>;

    public errors: LionErrorList;

    public constructor(errors: LionErrorList) {
        this.types = new Map();
        this.subSchemas = new Map();
        this.errors = errors;

        this.loadBuiltInTypes();
    }

    private loadBuiltInTypes() {
        this.registerType(
            "String",
            (value: DocumentComponent) =>
                value.isSingleValue() && typeof value.get() === "string",
        );

        this.registerType(
            "Number",
            (value: DocumentComponent) =>
                value.isSingleValue() && typeof value.get() === "number",
        );

        this.registerType(
            "Integer",
            (value: DocumentComponent) =>
                value.isSingleValue() &&
                typeof value.get() === "number" &&
                Number.isInteger(value.get()),
        );

        this.registerType(
            "Float",
            (value: DocumentComponent) =>
                value.isSingleValue() &&
                typeof value.get() === "number" &&
                !Number.isInteger(value.get()),
        );

        this.registerType(
            "Boolean",
            (value: DocumentComponent) =>
                value.isSingleValue() && typeof value.get() === "boolean",
        );

        this.registerType(
            "Array",
            (value: DocumentComponent, of: SchemaComponent | undefined) =>
                value.isArray &&
                (of
                    ? Array.from(value.values()).every((v) => of.validate(v))
                    : true),
        );

        this.registerType("Any", (value: DocumentComponent) => true);
    }

    public registerType(name: string, check: TypeCheck) {
        this.types.set(name, check);
    }

    public registerSubSchema(name: string, schema: Schema) {
        this.subSchemas.set(name, schema);
    }

    public hasType(type: string): boolean {
        return this.types.has(type);
    }

    public getType(type: string): TypeCheck {
        const [typeName, of] = this.extractType(type);

        if (!this.hasType(typeName)) {
            this.errors.addError(
                new LionError(
                    `Type '${typeName}' does not exist.`,
                    new Region(0, 0, 0, 0),
                ),
            );
        }
        return this.types.get(typeName) as TypeCheck;
    }

    public validateType(
        type: SchemaComponent,
        value: DocumentComponent,
    ): boolean {
        // console.log("================================start");
        // console.log({ type, value });

        const { type: typeName, of } = type;

        if (!this.hasType(typeName)) {
            this.errors.addError(
                new LionError(
                    `Type '${type.toString()}' does not exist.`,
                    value.region || new Region(0, 0, 0, 0),
                ),
            );
            return false;
        }

        const check = this.getType(typeName);

        const val = check(value, of);
        // console.log({ value, typeName, of, val, check });
        // console.log("================================end");
        return val;
    }

    public extractType(type: string): [string, string] | [string] {
        const match = /(\w+)<([\w|<>]+)>/g.exec(type);

        return match && match[2] ? [match[1], match[2]] : [type];
    }
}

/**
 * A type alias for a function that checks the type of a given value.
 *
 * @param value - The value to be checked, which is of type `DocumentComponent`.
 * @param of - An optional parameter that is another `SchemaComponent`.
 * @returns A boolean indicating whether the value passes the type check.
 */
export type TypeCheck = (
    value: DocumentComponent,
    of?: SchemaComponent,
) => boolean;
