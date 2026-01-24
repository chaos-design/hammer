import * as babel from '@babel/core';
import { describe, expect, it } from 'vitest';
import plugin from '../index.cjs';

describe('babel-plugin-jsx-source-location', () => {
  it('should add data-source-loc attribute to JSX elements', () => {
    const code = `
      function App() {
        return (
          <div>
            <h1>Hello World</h1>
          </div>
        );
      }
    `;

    const result = babel.transformSync(code, {
      filename: 'App.js',
      presets: ['@babel/preset-react'],
      plugins: [plugin],
    });

    expect(result?.code).toContain('"data-source-loc": "/App.js:4:10"');
    expect(result?.code).toContain('"data-source-loc": "/App.js:5:12"');
  });

  it('should handle nested elements', () => {
    const code = `
      const Component = () => (
        <main>
          <header>
            <nav />
          </header>
        </main>
      );
    `;

    const result = babel.transformSync(code, {
      filename: 'Component.js',
      presets: ['@babel/preset-react'],
      plugins: [plugin],
    });

    expect(result?.code).toContain('"data-source-loc": "/Component.js:3:8"');
    expect(result?.code).toContain('"data-source-loc": "/Component.js:4:10"');
    expect(result?.code).toContain('"data-source-loc": "/Component.js:5:12"');
  });
});
