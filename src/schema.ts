import { LionError, errors } from "./errors";
import { Region } from "./lexer";
import { DocumentComponent } from "./types";

export class SchemaComponent {
    public type: string;

    constructor(type: string) {
        this.type = type;
    }

    public validate(value: DocumentComponent): boolean {
        return TypeRegistry.instance.validateType(this.type, value);
    }
}

export class Schema {
    public components: Map<string, SchemaComponent>;

    constructor() {
        this.components = new Map();
    }

    public addComponent(name: string, component: SchemaComponent) {
        this.components.set(name, component);
    }

    public validate(
        value: DocumentComponent,
        process: boolean = false,
        clear: boolean = true
    ): boolean {
        if (value.isSingleValue()) {
            errors.addError(
                new LionError(
                    `Expected object, got single value`,
                    value.region || new Region(0, 0, 0, 0)
                )
            );
            if (process) {
                errors.process();
            }
            if (clear) {
                errors.errors = [];
            }
            return false;
        }
        if (value.size !== this.components.size) {
            errors.addError(
                new LionError(
                    `Expected ${this.components.size} keys, got ${value.size}`,
                    value.region || new Region(0, 0, 0, 0)
                )
            );
            if (process) {
                errors.process();
            }
            if (clear) {
                errors.errors = [];
            }
            return false;
        }

        for (const [key, component] of this.components) {
            if (!value.has(key)) {
                errors.addError(
                    new LionError(
                        `Expected key ${key} to be present.`,
                        value.region || new Region(0, 0, 0, 0)
                    )
                );
                if (process) {
                    errors.process();
                }
                if (clear) {
                    errors.errors = [];
                }
                return false;
            }
            if (!component.validate(value.get(key) as DocumentComponent)) {
                errors.addError(
                    new LionError(
                        `Expected key ${key} to satisfy constrains of type ${component.type}.`,
                        value.region || new Region(0, 0, 0, 0)
                    )
                );
                if (process) {
                    errors.process();
                }
                if (clear) {
                    errors.errors = [];
                }
                return false;
            }
        }

        errors.errors = [];
        return true;
    }

    public toTypeCheck(): TypeCheck {
        return (value: DocumentComponent) => {
            if (value.isSingleValue()) return false;
            return this.validate(value);
        };
    }

    public stringify(): string {
        return `@definition {
${Array.from(this.components)
    .map(([key, value]) => `\t${key}: ${value.type}`)
    .join(",\n")}
}
        
${Array.from(TypeRegistry.instance.subSchemas)
    .map(([key, value]) => value.stringifyAsSubSchema(key))
    .join("\n")}
`;
    }

    public stringifyAsSubSchema(name: string): string {
        return `@subschema ${name} {
${Array.from(this.components)
    .map(([key, value]) => `\t${key}: ${value.type}`)
    .join(",\n")}
}       
        `;
    }
}

export class TypeRegistry {
    public static instance = new TypeRegistry();

    public types: Map<string, TypeCheck>;
    public subSchemas: Map<string, Schema>;

    private constructor() {
        this.types = new Map();
        this.subSchemas = new Map();
    }

    public registerType(name: string, check: TypeCheck) {
        this.types.set(name, check);
    }

    public registerSubSchema(name: string, schema: Schema) {
        this.subSchemas.set(name, schema);
    }

    public getTypeOrNull(type: string): TypeCheck | null {
        const [typeName, of] = this.extractType(type);

        return this.types.get(typeName) || null;
    }

    public hasType(type: string): boolean {
        return this.types.has(type);
    }

    public getType(type: string): TypeCheck {
        const [typeName, of] = this.extractType(type);

        if (!this.hasType(typeName)) {
            errors.addError(
                new LionError(
                    `Type ${typeName} does not exist`,
                    new Region(0, 0, 0, 0)
                )
            );
        }
        return this.types.get(typeName) as TypeCheck;
    }

    public validateType(type: string, value: DocumentComponent): boolean {
        // console.log("================================start");
        // console.log({ type, value });
        const [typeName, of] = this.extractType(type);

        if (!this.hasType(typeName)) {
            errors.addError(
                new LionError(
                    `Type ${typeName} does not exist`,
                    value.region || new Region(0, 0, 0, 0)
                )
            );
            return false;
        }

        const check = this.getType(typeName);

        const val = check(value, of ? this.getType(of) : undefined);
        // console.log({ value, typeName, of, val, check });
        // console.log("================================end");
        return val;
    }

    public extractType(type: string): [string, string] | [string] {
        const match = /(\w+)<([\w<>]+)>/g.exec(type);

        return match && match[2] ? [match[1], match[2]] : [type];
    }
}

export type TypeCheck = (value: DocumentComponent, of?: TypeCheck) => boolean;

TypeRegistry.instance.registerType(
    "String",
    (value: DocumentComponent) =>
        value.isSingleValue() && typeof value.get() === "string"
);

TypeRegistry.instance.registerType(
    "Number",
    (value: DocumentComponent) =>
        value.isSingleValue() && typeof value.get() === "number"
);

TypeRegistry.instance.registerType(
    "Integer",
    (value: DocumentComponent) =>
        value.isSingleValue() &&
        typeof value.get() === "number" &&
        Number.isInteger(value.get())
);

TypeRegistry.instance.registerType(
    "Float",
    (value: DocumentComponent) =>
        value.isSingleValue() &&
        typeof value.get() === "number" &&
        !Number.isInteger(value.get())
);

TypeRegistry.instance.registerType(
    "Boolean",
    (value: DocumentComponent) =>
        value.isSingleValue() && typeof value.get() === "boolean"
);

TypeRegistry.instance.registerType(
    "Array",
    (value: DocumentComponent, of: TypeCheck | undefined) =>
        value.isArray &&
        (of ? Array.from(value.values()).every((v) => of(v)) : true)
);
