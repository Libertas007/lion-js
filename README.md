# Libertas Object Notation parser

This library can be used to parse text in `lion` format.

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

### `stringifyDocument`

This function takes a Lion document and stringifies it.

```js
import { parseText, stringifyDocument } from "lion-parser";

const document = parseText('@doc {example: "example"}');

console.log(stringifyDocument(document));
```

### `analyzeText`

This function checks for any errors, which might be in the specified string, and returns them as `LionError[]`.

```js
import { analyzeText } from "lion-parser";

const errors = analyzeText('@doc {example: "example"}');
```
