// scratch/apply_simple_quizzes.js
const fs = require('fs');
const path = require('path');

// Require the quiz definitions from generate_simple_quizzes.js
const quizzesScript = fs.readFileSync(path.join(__dirname, 'generate_simple_quizzes.js'), 'utf8');
const QUIZZES = eval(`(() => { ${quizzesScript}; return QUIZZES; })()`);

function distributeQuizOptions(quiz, lessonIndex) {
  return quiz.map((q, qi) => {
    const correctOpt = q.options[q.answer || 0];
    const distractors = q.options.filter((_, idx) => idx !== (q.answer || 0));
    
    // Deterministic position between 0 and 3
    const newCorrectIdx = (lessonIndex * 3 + qi + 1) % 4;
    
    const newOptions = [];
    let distractorIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === newCorrectIdx) {
        newOptions.push(correctOpt);
      } else {
        newOptions.push(distractors[distractorIdx++]);
      }
    }
    return {
      q: q.q,
      options: newOptions,
      answer: newCorrectIdx
    };
  });
}

// 1. Update server/curriculum.json
const currFile = path.join(__dirname, '..', 'server', 'curriculum.json');
const currData = JSON.parse(fs.readFileSync(currFile, 'utf8'));

currData.lessons.forEach((l, idx) => {
  if (QUIZZES[l.id]) {
    l.quiz = distributeQuizOptions(QUIZZES[l.id], idx);
  } else {
    console.warn('⚠️ No quiz for lesson ID:', l.id);
  }
});

fs.writeFileSync(currFile, JSON.stringify(currData, null, 2), 'utf8');
console.log('✅ Updated server/curriculum.json with 88 simplified quizzes!');

// 2. Update python-academy-complete/index.html
const indexFile = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const m = html.match(/const LESSONS\s*=\s*(\[[\s\S]*?\]);\s*const CHALLENGES/);
if (m) {
  const lessons = JSON.parse(m[1]);
  lessons.forEach((l, idx) => {
    if (QUIZZES[l.id]) {
      l.quiz = distributeQuizOptions(QUIZZES[l.id], idx);
    }
  });
  const newLessonsStr = 'const LESSONS = ' + JSON.stringify(lessons) + ';\nconst CHALLENGES';
  html = html.replace(m[0], newLessonsStr);
  console.log('✅ Replaced LESSONS array in index.html with 88 simplified quizzes!');
} else {
  console.error('❌ Could not find LESSONS in index.html');
  process.exit(1);
}

// 3. Enhance gradeQuiz(id)
const oldGradeQuizRegex = /function gradeQuiz\(id\)\{[\s\S]*?score===l\.quiz\.length\?'Perfect — mastery check passed\.':'Review the explanations and try again\.'`[\s\S]*?\}/;

const newGradeQuiz = `function gradeQuiz(id){
  const l = lessonById(id);
  let unanswered = false;
  for (let i = 0; i < l.quiz.length; i++) {
    if (quizSelection[\`\${id}-\${i}\`] === undefined) {
      unanswered = true;
      break;
    }
  }
  const resEl = document.getElementById('quiz-result-' + id);
  if (unanswered) {
    if (resEl) {
      resEl.className = 'status bad';
      resEl.textContent = 'Please choose an answer for both questions before checking.';
    }
    return;
  }
  let score = 0;
  l.quiz.forEach((q, i) => {
    if (quizSelection[\`\${id}-\${i}\`] === q.answer) score++;
  });
  quizScore[id] = score;
  state.quizResults[id] = Math.max(state.quizResults[id] ?? -1, score);
  const isPerfect = score === l.quiz.length;
  if (isPerfect && !state.quizXpAwarded[id]) {
    state.xp += score * 2;
    state.quizXpAwarded[id] = true;
  }
  save();
  if (resEl) {
    resEl.className = 'status ' + (isPerfect ? 'ok' : 'bad');
    resEl.innerHTML = isPerfect 
      ? \`<strong>Score: \${score} / \${l.quiz.length} (100% Correct) 🎉</strong> Mastery check passed! You are ready to mark this lesson mastered.\`
      : \`<strong>Score: \${score} / \${l.quiz.length}.</strong> Almost there! Review your answers or check the example above, then try again.\`;
  }
  if (isPerfect) {
    triggerConfetti(35);
    showToast('🎉 Mastery Check Passed! 100% Correct', 'ok');
  }
}`;

if (oldGradeQuizRegex.test(html)) {
  html = html.replace(oldGradeQuizRegex, newGradeQuiz);
  console.log('✅ Replaced gradeQuiz with enhanced feedback and celebration!');
} else {
  console.warn('⚠️ Could not match oldGradeQuizRegex, searching alternative...');
  const altOld = "function gradeQuiz(id){const l=lessonById(id); let score=0; l.quiz.forEach((q,i)=>{if(quizSelection[`${id}-${i}`]===q.answer)score++;}); quizScore[id]=score; state.quizResults[id]=Math.max(state.quizResults[id]??-1,score); if(!state.quizXpAwarded[id]){state.xp+=score*2; state.quizXpAwarded[id]=true;} save(); setTimeout(()=>{const x=document.getElementById('quiz-result-'+id); if(x)x.textContent=`Score: ${score} / ${l.quiz.length}. ${score===l.quiz.length?'Perfect — mastery check passed.':'Review the explanations and try again.'}`; },0);}";
  if (html.includes(altOld)) {
    html = html.replace(altOld, newGradeQuiz);
    console.log('✅ Replaced exact altOld gradeQuiz!');
  } else {
    console.error('❌ Could not find old gradeQuiz in index.html');
  }
}

fs.writeFileSync(indexFile, html, 'utf8');
console.log('✅ Updated index.html successfully!');
