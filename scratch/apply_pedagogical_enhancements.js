// scratch/apply_pedagogical_enhancements.js
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Definition of pedagogical helpers (generateLessonHint, triggerConfetti, showCelebrationModal, closeCelebration, showMasteryRequirementModal, showToast, sendPracticeToLab, insertStarterScaffold, toggleLessonHint)
const helpersCode = `
// --- Beginner Pedagogical Enhancements & Celebration Engine ---
function generateLessonHint(l) {
  const code = l.code || '';
  const syntax = l.syntax || '';
  if (code.includes('def ')) {
    return 'Define your function with <code>def function_name(param):</code>, indent the body by 4 spaces, and return a result using <code>return</code>.';
  }
  if (code.includes('for ') || code.includes('while ')) {
    return 'Make sure your loop line ends with a colon <code>:</code> and all statements inside the loop are indented with 4 spaces.';
  }
  if (code.includes('if ') || code.includes('elif ')) {
    return 'Remember to put a colon <code>:</code> at the end of your <code>if</code> condition, and indent the code underneath.';
  }
  if (code.includes('input(')) {
    return 'Remember that <code>input("Prompt: ")</code> returns text. To do math with it, wrap it in <code>int()</code> or <code>float()</code>.';
  }
  if (code.includes('[') && code.includes(']')) {
    return 'Lists use square brackets like <code>items = ["apple", "banana"]</code>. You can access items using <code>items[0]</code> or add items with <code>items.append(...)</code>.';
  }
  if (code.includes('{') && code.includes('}')) {
    return 'Dictionaries hold key-value pairs like <code>data = {"name": "Alice", "age": 20}</code>. Access values with <code>data["name"]</code>.';
  }
  if (code.includes('print(')) {
    return 'Call <code>print(...)</code> with your own text inside quotes or variables, like <code>print("My result:", value)</code>.';
  }
  return 'Look at the example code above. Change the values, add a new variable or print statement, and test what happens!';
}

function toggleLessonHint(id) {
  const el = document.getElementById('lesson-hint-' + id);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

function insertStarterScaffold(id) {
  const l = lessonById(id);
  const ed = document.getElementById('practice-code-' + id);
  if (!ed) return;
  if (ed.value.trim() && ed.value.trim() !== l.code.trim()) {
    if (!confirm('Replace current editor code with starter template?')) return;
  }
  ed.value = \`# Lesson: \${l.title}\\n# Task: \${l.practice}\\n\\n\${l.code}\\n\\n# Add your code changes below:\\n\`;
  ed.focus();
}

function sendPracticeToLab(id) {
  const ed = document.getElementById('practice-code-' + id);
  const code = ed ? ed.value : (lessonById(id)?.code || '');
  state.labCode = code;
  save();
  go('lab');
}

function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const bg = type === 'ok' ? 'rgba(0, 230, 118, 0.95)' : type === 'bad' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(124, 92, 255, 0.95)';
  const color = type === 'ok' ? '#062816' : '#fff';
  toast.style.cssText = \`background:\${bg};color:\${color};font-weight:600;font-size:14px;padding:12px 20px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);pointer-events:auto;display:flex;align-items:center;gap:10px\`;
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

function triggerConfetti(particleCount = 70) {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999';
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#7c5cff', '#00f2fe', '#4facfe', '#00e676', '#ffd166', '#ff4081', '#a855f7'];
  const particles = Array.from({ length: particleCount }, () => ({
    x: canvas.width * (0.2 + Math.random() * 0.6),
    y: canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 16,
    vy: -(Math.random() * 14 + 8),
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 10,
    alpha: 1
  }));

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.vx *= 0.98;
      p.rot += p.vrot;
      if (frame > 40) p.alpha -= 0.02;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });
    frame++;
    if (alive && frame < 130) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(update);
}

function showCelebrationModal({ title, subtitle, xp, nextId }) {
  triggerConfetti(85);
  let modal = document.getElementById('celebration-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'celebration-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,18,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px';
    document.body.appendChild(modal);
  }
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(124,92,255,0.4);border-radius:24px;max-width:440px;width:100%;padding:32px 28px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.6)">
      <div style="font-size:52px;line-height:1;margin-bottom:12px">🎉</div>
      <div style="display:inline-block;padding:4px 14px;background:rgba(0,230,118,0.15);border:1px solid #00e676;color:#00e676;border-radius:999px;font-weight:700;font-size:13px;margin-bottom:12px">
        +\${xp} XP EARNED
      </div>
      <h2 style="font-size:22px;margin:0 0 8px;color:#fff">\${esc(title)}</h2>
      <p style="color:#94a3b8;font-size:14.5px;margin:0 0 24px;line-height:1.5">\${esc(subtitle)}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        \${nextId ? \`<button class="primary" style="padding:12px 22px;font-size:14px;font-weight:700" onclick="closeCelebration(); go('lesson', '\${nextId}')">Next Lesson ➔</button>\` : ''}
        <button class="ghost" style="padding:12px 18px;font-size:14px" onclick="closeCelebration()">Keep Exploring</button>
      </div>
    </div>
  \`;
  modal.style.display = 'flex';
}

function closeCelebration() {
  const m = document.getElementById('celebration-modal');
  if (m) m.style.display = 'none';
}

function showMasteryRequirementModal(l) {
  const practiceDone = !!state.lessonPractice[l.id];
  const quizDone = state.quizResults[l.id] === l.quiz.length;
  let modal = document.getElementById('mastery-req-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mastery-req-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,8,18,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px';
    document.body.appendChild(modal);
  }
  modal.innerHTML = \`
    <div style="background:#0e1526;border:1px solid rgba(255,255,255,0.15);border-radius:20px;max-width:440px;width:100%;padding:28px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.6)">
      <div style="font-size:36px;text-align:center;margin-bottom:8px">🎯</div>
      <h3 style="font-size:20px;text-align:center;margin:0 0 6px;color:#fff">Almost Ready for Mastery!</h3>
      <p style="text-align:center;color:#94a3b8;font-size:14px;margin:0 0 20px">To solidify your understanding, complete these 2 quick steps:</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid \${practiceDone ? '#00e676' : 'rgba(255,255,255,0.1)'};border-radius:12px">
          <span style="font-size:18px">\${practiceDone ? '✅' : '⏳'}</span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;color:#fff">1. Run the Practice Code</div>
            <div style="font-size:12px;color:#94a3b8">\${practiceDone ? 'Practice completed successfully!' : 'Write & run your code under the Practice section'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid \${quizDone ? '#00e676' : 'rgba(255,255,255,0.1)'};border-radius:12px">
          <span style="font-size:18px">\${quizDone ? '✅' : '⏳'}</span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;color:#fff">2. Quick Mastery Check</div>
            <div style="font-size:12px;color:#94a3b8">\${quizDone ? 'All questions answered correctly!' : \`Answer the \${l.quiz.length} quiz questions and click "Check answers"\`}</div>
          </div>
        </div>
      </div>
      <div style="text-align:center">
        <button class="primary" style="padding:10px 24px;width:100%" onclick="document.getElementById('mastery-req-modal').style.display='none'">Got it, let's do it! 🚀</button>
      </div>
    </div>
  \`;
  modal.style.display = 'flex';
}
`;

// Insert helpers before function renderLesson(id)
if (!content.includes('// --- Beginner Pedagogical Enhancements & Celebration Engine ---')) {
  content = content.replace('function renderLesson(id){', helpersCode + '\nfunction renderLesson(id){');
}

// 2. Enhance Practice section in renderLesson(id)
// We add Hint, Starter Scaffold, and Open in Code Lab buttons
const oldPracticeSection = `<div class="section"><h3>🧪 Practice</h3><div class="status"><strong>Your task:</strong><br>\${esc(l.practice)}<br><br><span class="muted">Do the task in the editor below, then run it. Practice is counted only after your code executes successfully.</span></div>`;
const newPracticeSection = `<div class="section"><h3>🧪 Practice</h3><div class="status"><strong>Your task:</strong><br>\${esc(l.practice)}<br><br><span class="muted">Do the task in the editor below, then run it. Practice is counted only after your code executes successfully.</span></div><div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="ghost small-btn" onclick="toggleLessonHint('\${l.id}')">💡 Need a Hint?</button><button class="ghost small-btn" onclick="insertStarterScaffold('\${l.id}')">📝 Starter Scaffold</button><button class="ghost small-btn" onclick="sendPracticeToLab('\${l.id}')">🔬 Open in Code Lab</button></div><div id="lesson-hint-\${l.id}" style="display:none;margin-top:10px;padding:12px 14px;background:rgba(124,92,255,0.14);border:1px solid rgba(124,92,255,0.35);border-radius:12px;font-size:13.5px;line-height:1.55;color:#e2e8f0"><strong>💡 Beginner Hint:</strong> \${generateLessonHint(l)}</div>`;

if (content.includes(oldPracticeSection)) {
  content = content.replace(oldPracticeSection, newPracticeSection);
  console.log('✅ Replaced Practice Section with Hint, Scaffold, and Lab button');
} else {
  console.log('⚠️ Could not find exact oldPracticeSection');
}

// 3. Enhance runPractice to trigger celebratory toast and mini confetti
const oldRunPracticeSuccess = `result.className='status ok';result.textContent='Practice completed ✓ Your code ran successfully.'+(out.trim()?\` Output: \${out.trim()}\`:' No output was produced.');`;
const newRunPracticeSuccess = `result.className='status ok';result.textContent='Practice completed ✓ Your code ran successfully.'+(out.trim()?\` Output: \${out.trim()}\`:' No output was produced.'); triggerConfetti(35); showToast('🎉 Practice completed! +3 XP earned!', 'ok');`;

if (content.includes(oldRunPracticeSuccess)) {
  content = content.replace(oldRunPracticeSuccess, newRunPracticeSuccess);
  console.log('✅ Replaced runPractice success with celebration & toast');
} else {
  console.log('⚠️ Could not find exact oldRunPracticeSuccess');
}

// 4. Enhance completeLesson
const oldCompleteLesson = `function completeLesson(id){const l=lessonById(id); if(!state.lessonPractice[id]||state.quizResults[id]!==l.quiz.length){alert('Finish Practice and get a perfect Quick Mastery Check before marking the lesson mastered.'); return;} if(!state.completedLessons.includes(id)){state.completedLessons.push(id);state.xp+=10;} save();}`;
const newCompleteLesson = `function completeLesson(id){
  const l=lessonById(id);
  if(!state.lessonPractice[id] || state.quizResults[id] !== l.quiz.length){
    showMasteryRequirementModal(l);
    return;
  }
  const isNew = !state.completedLessons.includes(id);
  if(isNew){
    state.completedLessons.push(id);
    state.xp+=10;
  }
  save();
  const nextCandidate = nextLessonFor(l.id);
  const next = nextCandidate && (nextCandidate.level === l.level || levelUnlocked(nextCandidate.level)) ? nextCandidate : null;
  showCelebrationModal({
    title: 'Lesson Mastered! 🌟',
    subtitle: \`Outstanding job mastering "\${l.title}". Your Python skills are growing!\`,
    xp: isNew ? 10 : 0,
    nextId: next ? next.id : null
  });
}`;

if (content.includes(oldCompleteLesson)) {
  content = content.replace(oldCompleteLesson, newCompleteLesson);
  console.log('✅ Replaced completeLesson with celebration modal & requirement modal');
} else {
  console.log('⚠️ Could not find exact oldCompleteLesson');
}

// 5. Enhance runChallenge celebration
const oldChallengeSuccess = `if(passed){status.textContent='All tests passed! Challenge solved. 🎉'; if(!state.completedChallenges.includes(id)){state.completedChallenges.push(id);state.xp+=25;save();}}`;
const newChallengeSuccess = `if(passed){status.textContent='All tests passed! Challenge solved. 🎉'; const isNew = !state.completedChallenges.includes(id); if(isNew){state.completedChallenges.push(id);state.xp+=25;save();} showCelebrationModal({ title: 'Challenge Conquered! 🏆', subtitle: \`You solved "\${c.title}" by passing all test cases!\`, xp: isNew ? 25 : 0, nextId: null });}`;

if (content.includes(oldChallengeSuccess)) {
  content = content.replace(oldChallengeSuccess, newChallengeSuccess);
  console.log('✅ Replaced runChallenge success with celebration modal');
} else {
  console.log('⚠️ Could not find exact oldChallengeSuccess');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Updated index.html successfully!');
