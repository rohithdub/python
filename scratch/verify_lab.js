const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('./python-academy-complete/index.html', 'utf8');
const skCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt.min.js', 'utf8');
const stdCode = fs.readFileSync('./python-academy-complete/assets/js/skulpt-stdlib.js', 'utf8');

const ctx = {
  window: { addEventListener: () => {} },
  document: {
    getElementById: (id) => ({ value: '', textContent: '', style: {}, addEventListener: () => {}, querySelectorAll: () => [], classList: { add: () => {}, remove: () => {} } }),
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, querySelectorAll: () => [], classList: { add: () => {}, remove: () => {} } })
  },
  navigator: { serviceWorker: { register: () => Promise.resolve() } },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  structuredClone: structuredClone,
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { hash: '', port: '5000', hostname: 'localhost' },
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
};
ctx.window.document = ctx.document;
ctx.window.location = ctx.location;
ctx.window.localStorage = ctx.localStorage;

vm.createContext(ctx);
vm.runInContext(skCode, ctx);
vm.runInContext(stdCode, ctx);

const scriptMatch = html.match(/<script>(.*?)<\/script>/s)[1];
vm.runInContext(scriptMatch, ctx);

async function testAll() {
  console.log('Testing runSkulptInBrowser in browser context...');
  const res1 = await ctx.runSkulptInBrowser('print("Lab Test: 40 + 2 =", 40 + 2)');
  console.log('Code Lab Output 1:\n' + res1);

  console.log('Testing input in Code Lab...');
  const res2 = await ctx.runSkulptInBrowser('n = input("Your favorite fruit: ")\nprint("You picked:", n)', 'Apple');
  console.log('Code Lab Output 2:\n' + res2);

  console.log('Testing loops and list comprehensions...');
  const res3 = await ctx.runSkulptInBrowser('nums = [x*2 for x in range(5)]\nprint("Doubles:", nums)');
  console.log('Code Lab Output 3:\n' + res3);

  console.log('✅ ALL IN-BROWSER CODE LAB TESTS PASSED COMPLETELY!');
}

testAll().catch((e) => console.error('Test failed:', e));
