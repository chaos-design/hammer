import path from 'node:path';
import * as babel from '@babel/core';
import { describe, expect, it } from 'vitest';
import plugin from '../index.cjs';

const cwd = process.cwd();

const transform = (code: string, opts: object = {}, filename = 'App.js') =>
  babel.transformSync(code, {
    filename,
    presets: ['@babel/preset-react'],
    plugins: [Object.keys(opts).length ? [plugin, opts] : plugin] as never,
    cwd,
    babelrc: false,
    configFile: false,
  })?.code;

describe('babel-plugin-jsx-source-location', () => {
  it('adds data-source-loc to JSX elements', () => {
    const code = `
      function App() {
        return (
          <div>
            <h1>Hello World</h1>
          </div>
        );
      }
    `;

    const result = transform(code);

    expect(result).toContain('"data-source-loc": "App.js:4:10"');
    expect(result).toContain('"data-source-loc": "App.js:5:12"');
  });

  it('handles nested elements', () => {
    const code = `
      const Component = () => (
        <main>
          <header>
            <nav />
          </header>
        </main>
      );
    `;

    const result = transform(code, {}, 'Component.js');

    expect(result).toContain('"data-source-loc": "Component.js:3:8"');
    expect(result).toContain('"data-source-loc": "Component.js:4:10"');
    expect(result).toContain('"data-source-loc": "Component.js:5:12"');
  });

  it('updates an existing data-source-loc attribute', () => {
    const code = `
      function App() {
        return (
          <div data-source-loc="original">
            <h1>Hello World</h1>
          </div>
        );
      }
    `;

    const result = transform(code);

    expect(result).toContain('"data-source-loc": "App.js:4:10"');
    expect(result).not.toContain('"data-source-loc": "original"');
  });

  it('uses a custom attribute name', () => {
    const code = `
      function App() {
        return (
          <div>
            <h1>Hello World</h1>
          </div>
        );
      }
    `;

    const result = transform(code, { attributeName: 'data-custom-loc' });

    expect(result).toContain('"data-custom-loc": "App.js:4:10"');
    expect(result).toContain('"data-custom-loc": "App.js:5:12"');
    expect(result).not.toContain('data-source-loc');
  });

  it('reports the path relative to cwd, without a leading slash', () => {
    const code = 'const App = () => <div />;';
    const filename = path.join(cwd, 'src', 'App.tsx');

    const result = transform(code, {}, filename);

    expect(result).toContain('"data-source-loc": "src/App.tsx:1:18"');
  });

  it('strips only the leading cwd occurrence', () => {
    // A directory whose name also appears mid-path must not be truncated.
    const code = 'const App = () => <div />;';
    const filename = path.join(cwd, 'src', path.basename(cwd), 'App.tsx');

    const result = transform(code, {}, filename);

    expect(result).toContain(
      `"data-source-loc": "src/${path.basename(cwd)}/App.tsx:1:18"`,
    );
  });

  it('keeps the full path when the file sits outside cwd', () => {
    const code = 'const App = () => <div />;';
    const filename = path.join(cwd, '..', 'outside', 'App.tsx');

    const result = transform(code, {}, filename);

    expect(result).toContain('"data-source-loc":');
    expect(result).not.toContain('"data-source-loc": "/App.tsx');
  });

  it('leaves a relative filename untouched', () => {
    const code = 'const App = () => <div />;';

    const result = transform(code, {}, 'src/App.tsx');

    expect(result).toContain('"data-source-loc": "src/App.tsx:1:18"');
  });
});
