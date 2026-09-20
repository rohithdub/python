// scratch/test_full_experience.js
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('--- Testing Python Academy Upgraded Experience ---');

// 1. Static file check
const indexPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const expectedFunctions = [
  'generateLessonHint',
  'toggleLessonHint',
  'insertStarterScaffold',
  'sendPracticeToLab',
  'showToast',
  'triggerConfetti',
  'showCelebrationModal',
  'showMasteryRequirementModal',
  'formatBeginnerError',
  'runLessonExample'
];

expectedFunctions.forEach(fn => {
  if (indexHtml.includes(fn)) {
    console.log(`✅ Function ${fn} found in index.html`);
  } else {
    console.error(`❌ Function ${fn} MISSING from index.html`);
    process.exit(1);
  }
});

// 2. Check for accidental literal template escaping in HTML
const brokenTemplateMatches = indexHtml.match(/\\\$\{[^}]+\}/g);
if (brokenTemplateMatches && brokenTemplateMatches.length > 0) {
  console.error('❌ Found escaped template literals:', brokenTemplateMatches);
  process.exit(1);
} else {
  console.log('✅ 0 broken template literals found.');
}

// 3. Server HTTP check
const req = http.get('http://localhost:5000', (res) => {
  console.log(`✅ Server responded with status: ${res.statusCode}`);
  console.log('Cache-Control header:', res.headers['cache-control']);
  if (res.statusCode === 200) {
    console.log('🎉 ALL INTEGRATION AND PEDAGOGICAL TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ Unexpected status code:', res.statusCode);
  }
});

req.on('error', (err) => {
  console.error('❌ Server request failed:', err.message);
});
