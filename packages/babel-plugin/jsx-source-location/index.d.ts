import type { ConfigAPI, PluginObj } from '@babel/core';

export interface Options {
  /**
   * Name of the attribute added to every JSX opening element.
   * @default "data-source-loc"
   */
  attributeName?: string;
}

declare const jsxSourceLocation: (
  api: ConfigAPI,
  options: Options,
) => PluginObj;

export = jsxSourceLocation;
