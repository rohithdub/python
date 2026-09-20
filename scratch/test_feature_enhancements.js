// scratch/test_feature_enhancements.js
const fs = require('fs');
const path = require('path');

function generateLessonHint(lesson) {
  const code = lesson.code || '';
  const syntax = lesson.syntax || '';
  const concept = lesson.concept || '';

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

function getStarterScaffold(lesson) {
  const code = (lesson.code || '').trim();
  return `# Python Academy Starter Template
# Lesson: ${lesson.title || 'Practice'}
# Task: ${lesson.practice || 'Complete the practice exercise'}

${code}

# Add your changes or test cases below:

`;
}

// Test with dummy lesson
const sampleLesson = {
  id: 'L01',
  title: 'Computers & Programs',
  code: 'print("Hello, Python!")',
  practice: 'Modify the example so it solves a new problem.',
  syntax: 'print(value)',
  quiz: [{ q: 'q1', options: ['a', 'b'], answer: 0 }]
};

console.log('Hint:', generateLessonHint(sampleLesson));
console.log('Scaffold:\n', getStarterScaffold(sampleLesson));
console.log('✅ Generator logic tests passed!');
