// scratch/test_quiz_shuffle.js
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

const sample = [
  { q: 'Q1?', options: ['Correct1', 'Dist1', 'Dist2', 'Dist3'], answer: 0 },
  { q: 'Q2?', options: ['Correct2', 'DistA', 'DistB', 'DistC'], answer: 0 }
];

console.log('Lesson 0:', distributeQuizOptions(sample, 0));
console.log('Lesson 1:', distributeQuizOptions(sample, 1));
console.log('Lesson 2:', distributeQuizOptions(sample, 2));
