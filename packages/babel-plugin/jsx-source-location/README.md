# @chaos-design/babel-plugin-jsx-source-location

A Babel plugin that adds source file location (file path, line number, column number) to JSX elements as a `data-source-loc` attribute. This is useful for development tools that need to map DOM elements back to their source code (e.g., "Click to Component" functionality).

## Installation

```bash
pnpm add -D @chaos-design/babel-plugin-jsx-source-location
```

## Usage

### In Vite (with @vitejs/plugin-react)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsxSourceLocation from '@chaos-design/babel-plugin-jsx-source-location';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [jsxSourceLocation],
      },
    }),
  ],
});
```

### In Babel Config

```json
{
  "plugins": ["@chaos-design/babel-plugin-jsx-source-location"]
}
```

## Result

Input:

```jsx
<Button>Click me</Button>
```

Output:

```jsx
<Button data-source-loc="/src/components/Button.tsx:10:5">Click me</Button>
```
