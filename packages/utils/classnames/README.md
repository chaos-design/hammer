# @chaos-design/classnames

将 classNames 连接在一起

## 使用

### classnames

```ts
import c, { classnames } from '@chaos-design/classnames';

// c === classnames

const classList = c('chaos', 'classnames');
console.log(classList); // chaos classnames

c('foo', 'bar'); // => 'foo bar'
c('foo', { bar: true }); // => 'foo bar'
c({ 'foo-bar': true }); // => 'foo-bar'
c({ 'foo-bar': false }); // => ''
c({ foo: true }, { bar: true }); // => 'foo bar'
c({ foo: true, bar: true }); // => 'foo bar'

const cp = prefix('chaos-');

const classList = c('classnames');
console.log(classList); // chaos-classnames
```

### prefix

```ts
import { prefix } from '@chaos-design/classnames';

c('foo', 'bar'); // => 'foo bar'
c('foo', { bar: true }); // => 'foo bar'
c({ 'foo-bar': true }); // => 'foo-bar'
c({ 'foo-bar': false }); // => ''
c({ foo: true }, { bar: true }); // => 'foo bar'
c({ foo: true, bar: true }); // => 'foo bar'

const cp = prefix('chaos-');

const classList = c('classnames');
console.log(classList); // chaos-classnames
```
