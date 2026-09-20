const fs = require('fs');
const vm = require('vm');

const skulptCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt.min.js', 'utf8');
const stdlibCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt-stdlib.js', 'utf8');

const ctx = { window: {}, console: console, setTimeout: setTimeout, clearTimeout: clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(skulptCode, ctx);
vm.runInContext(stdlibCode, ctx);

const Sk = ctx.Sk;
let output = [];
let inputs = ['Rohith', '25'];
let inputIdx = 0;

Sk.configure({
  output: (str) => output.push(str),
  read: (x) => Sk.builtinFiles['files'][x],
  inputfun: (prompt) => {
    if (prompt) output.push(prompt + '\n');
    return inputs[inputIdx++] || '';
  },
  inputfunTakesPrompt: true
});

const code = `
name = input("Enter your name: ")
age = int(input("Enter your age: "))
print(f"Welcome {name}, next year you will be {age + 1}!")
`;

Sk.misceval
  .asyncToPromise(() => {
    return Sk.importMainWithBody('<stdin>', false, code, true);
  })
  .then(() => {
    console.log('OUTPUT:\n' + output.join(''));
    console.log('✅ input() works perfectly!');
  })
  .catch((err) => {
    console.error('Error:', err.toString());
  });
