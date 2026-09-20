// scratch/test_practice_acceptance.js
const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'python-academy-complete', 'index.html'), 'utf8');

// 1. Verify "modify the starter" blocking logic is completely gone
if (indexHtml.includes("Modify the starter example first")) {
  console.error("❌ Blocking 'Modify the starter' string still present in index.html!");
  process.exit(1);
} else {
  console.log("✅ Verified: 'Modify the starter' blocking error has been removed!");
}

// 2. Verify all lessons have simplified, beginner-friendly practice text
const m = indexHtml.match(/const LESSONS\s*=\s*(\[[\s\S]*?\]);\s*const CHALLENGES/);
const lessons = JSON.parse(m[1]);

let complexCount = 0;
lessons.forEach(l => {
  if (l.practice.includes("Add at least one edge case") || l.practice.includes("solves a new problem related to")) {
    complexCount++;
  }
});

if (complexCount > 0) {
  console.error(`❌ Found ${complexCount} lessons with old complex boilerplate practice!`);
  process.exit(1);
} else {
  console.log(`✅ All ${lessons.length} lessons now have simplified, beginner-friendly practice questions!`);
}

// Sample checks
console.log('Lesson 1 Practice:', lessons[0].practice);
console.log('Lesson 2 Practice:', lessons[1].practice);
console.log('Lesson 3 Practice:', lessons[2].practice);

console.log('🎉 PRACTICE ACCEPTANCE & SIMPLIFICATION VERIFIED 100%!');
