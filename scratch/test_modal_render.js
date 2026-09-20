const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('./python-academy-complete/index.html', 'utf8');

let modalBodyHtml = '';
const mockBody = {
  get innerHTML() { return modalBodyHtml; },
  set innerHTML(val) { modalBodyHtml = val; }
};

const ctx = {
  window: { addEventListener: () => {} },
  document: {
    getElementById: (id) => {
      if (id === 'authModalBody') return mockBody;
      return { value: '', textContent: '', style: {}, addEventListener: () => {}, querySelectorAll: () => [], classList: { add: () => {}, remove: () => {} } };
    },
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

// Load Skulpt stub or skip
const scriptMatch = html.match(/<script>(.*?)<\/script>/s)[1];
vm.runInContext(scriptMatch, ctx);

console.log('🧪 Testing Auth Modal Rendering...\n');

// 1. Test Login tab rendering
ctx.authTab = 'login';
ctx.renderAuthModal();
console.log('--- LOGIN TAB HTML ---');
console.log(modalBodyHtml);

if (modalBodyHtml.includes('${') || modalBodyHtml.includes('\\${')) {
  console.error('❌ FAIL: Raw template literals found in Login modal!');
  process.exit(1);
}
if (modalBodyHtml.includes('id="authUsername"')) {
  console.error('❌ FAIL: authUsername field should NOT be in Login modal!');
  process.exit(1);
}
if (!modalBodyHtml.includes('id="authIdentifier"') || !modalBodyHtml.includes('Sign In &amp; Sync') && !modalBodyHtml.includes('Sign In & Sync')) {
  console.error('❌ FAIL: Sign In button or identifier field missing!');
  process.exit(1);
}
console.log('✅ PASS: Login tab renders cleanly with no raw code and correct fields!\n');

// 2. Test Register tab rendering
ctx.switchAuthTab('register');
console.log('--- REGISTER TAB HTML ---');
console.log(modalBodyHtml);

if (modalBodyHtml.includes('${') || modalBodyHtml.includes('\\${')) {
  console.error('❌ FAIL: Raw template literals found in Register modal!');
  process.exit(1);
}
if (!modalBodyHtml.includes('id="authUsername"')) {
  console.error('❌ FAIL: authUsername field SHOULD be in Register modal!');
  process.exit(1);
}
if (!modalBodyHtml.includes('Create Account &amp; Sync') && !modalBodyHtml.includes('Create Account & Sync Progress')) {
  console.error('❌ FAIL: Create Account button missing!');
  process.exit(1);
}
console.log('✅ PASS: Register tab renders cleanly with Username field and Create Account button!\n');

console.log('🎉 ALL MODAL RENDERING TESTS PASSED PERFECTLY!');
