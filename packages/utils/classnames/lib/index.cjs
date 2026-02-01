"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  classnames: () => classnames,
  default: () => src_default,
  prefix: () => prefix
});
module.exports = __toCommonJS(src_exports);
var hasOwn = {}.hasOwnProperty;
function prefix(name = "") {
  return (...args) => {
    const classes = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!arg) {
        continue;
      }
      const argType = typeof arg;
      if (argType === "string" || argType === "number") {
        classes.push(arg);
      } else if (Array.isArray(arg)) {
        if (arg.length) {
          const inner = prefix(name).apply(null, arg);
          inner && classes.push(inner);
        }
      } else if (argType === "object") {
        if (arg.toString !== Object.prototype.toString) {
          classes.push(arg.toString());
        } else {
          for (const key in arg) {
            if (hasOwn.call(arg, key) && arg[key]) {
              classes.push(key);
            }
          }
        }
      }
    }
    return classes.map((c) => `${c}`.includes(name) ? c : name + c).join(" ");
  };
}
var classnames = prefix();
var src_default = classnames;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  classnames,
  prefix
});
