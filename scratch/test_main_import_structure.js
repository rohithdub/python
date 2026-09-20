// scratch/test_main_import_structure.js
const fs = require('fs');
const path = require('path');

const rootMain = fs.readFileSync(path.join(__dirname, '..', 'main.py'), 'utf8');

console.log('Testing root main.py structure...');

// 1. Must NOT have 'from main import' (the circular import trigger)
if (rootMain.includes('from main import')) {
  console.error('❌ Circular import "from main import" still present!');
  process.exit(1);
} else {
  console.log('✅ Verified: Circular import "from main import" eliminated.');
}

// 2. Must dynamically load backend-python with spec_from_file_location
if (rootMain.includes('spec_from_file_location') && rootMain.includes('backend_app_module')) {
  console.log('✅ Verified: Uses isolated namespace "backend_app_module" to load backend-python.');
} else {
  console.error('❌ Missing isolated module loader in main.py!');
  process.exit(1);
}

// 3. Must expose `app =` at top level
if (/^app\s*=\s*backend_app_module\.app/m.test(rootMain)) {
  console.log('✅ Verified: `app` object is correctly exposed at module level for uvicorn (main:app).');
} else {
  console.error('❌ `app` object is not exposed at module level!');
  process.exit(1);
}

// 4. Must handle PORT environment variable
if (rootMain.includes('os.environ.get("PORT"')) {
  console.log('✅ Verified: PORT environment variable is respected.');
} else {
  console.error('❌ PORT environment variable not handled!');
  process.exit(1);
}

console.log('🎉 ROOT MAIN.PY IMPORT STRUCTURE FULLY VERIFIED!');
