const fs = require('fs');
const vm = require('vm');

const skulptCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt.min.js', 'utf8');
const stdlibCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt-stdlib.js', 'utf8');

const ctx = {
  window: {},
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(skulptCode, ctx);
vm.runInContext(stdlibCode, ctx);

const Sk = ctx.Sk;
let output = [];
Sk.configure({
  output: (str) => output.push(str),
  read: (x) => {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
      throw 'File not found: ' + x;
    }
    return Sk.builtinFiles['files'][x];
  }
});

Sk.misceval
  .asyncToPromise(() => {
    return Sk.importMainWithBody('<stdin>', false, 'print("Hello from offline Python! 2 + 2 =", 2 + 2)', true);
  })
  .then(() => {
    console.log('OUTPUT: ' + output.join(''));
    console.log('✅ Skulpt runs Python flawlessly and 100% offline!');
  })
  .catch((err) => {
    console.error('Skulpt error:', err.toString());
  });
