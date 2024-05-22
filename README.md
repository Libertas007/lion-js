# Libertas Object Notation parser

This library can be used to parse text in `lion` format.

Learn more about lion here: [Libertas007/lion](https://github.com/Libertas007/lion)

## Usage

```js
import { parseText, stringifyDocument } from "lion-parser";

const document = parseText('@doc {example: "example"}');

console.log(stringifyDocument(document));
```

## Functions overview

### `parseText`

This function parses a string to a Lion document. If the input string is invalid, an error is thrown.

```js
import { parseText } from "lion-parser";

const document = parseText('@doc {example: "example"}');
```

### `parseTextOrNull`

Similar to the previous, this function parses a string to a Lion document. However, if the input string is invalid, it return `null` instead.

```js
import { parseTextOrNull } from "lion-parser";

const document = parseTextOrNull('@doc {example: "example"}');
```

### `parseSchema`

This function parses a string to a Lion schema. If the input string is invalid, an error is thrown.

```js
import { parseSchema } from "lion-parser";

const schema = parseSchema("@definition {example: String}");
```

### `parseSchemaOrNull`

Similar to the previous, this function parses a string to a Lion schema. However, if the input string is invalid, it return `null` instead.

```js
import { parseSchemaOrNull } from "lion-parser";

const schema = parseSchemaOrNull("@definition {example: String}");
```

### `stringifyDocument`

This function takes a Lion document and stringifies it.

```js
import { parseText, stringifyDocument } from "lion-parser";

const document = parseText('@doc {example: "example"}');

console.log(stringifyDocument(document));
```

### `stringifySchema`

This function takes a Lion document and stringifies it.

```js
import { parseSchema, stringifySchema } from "lion-parser";

const document = parseText("@definition {example: String}");

console.log(stringifySchema(document));
```

### `analyzeText`

This function checks for any errors, which might be in the specified string, and returns them as `LionError[]`.

```js
import { analyzeText } from "lion-parser";

const errors = analyzeText('@doc {example: "example"}');
```

### `analyzeSchema`

This function checks for any errors, which might be in the specified string, and returns them as `LionError[]`.

```js
import { analyzeSchema } from "lion-parser";

const errors = analyzeSchema("@definition {example: String}");
```
