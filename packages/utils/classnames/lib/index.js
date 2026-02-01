// src/index.ts
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
export {
  classnames,
  src_default as default,
  prefix
};
