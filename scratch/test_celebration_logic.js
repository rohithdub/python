// scratch/test_celebration_logic.js
function generateLessonHint(lesson) {
  let clue = '';
  const code = lesson.code || '';
  const syntax = lesson.syntax || '';
  const concept = lesson.concept || '';

  if (code.includes('print(') && !code.includes('input(') && !code.includes('def ')) {
    clue = 'Try calling <code>print(...)</code> with your own custom text inside quotation marks, like <code>print("My custom message!")</code>.';
  } else if (code.includes('input(')) {
    clue = 'Remember that <code>input("Prompt: ")</code> captures user text as a string. If you need numbers, wrap it in <code>int()</code>!';
  } else if (code.includes('if ') || code.includes('elif ')) {
    clue = 'Remember to put a colon <code>:</code> at the end of your <code>if</code> statement, and indent the code underneath by 4 spaces.';
  } else if (code.includes('for ') || code.includes('while ')) {
    clue = 'Loops repeat code. Make sure your loop line ends with <code>:</code> and all statements inside the loop are indented.';
  } else if (code.includes('def ')) {
    clue = 'Define your function with <code>def function_name(param):</code>, indent the body, and return a value using <code>return</code>.';
  } else if (code.includes('[') && code.includes(']')) {
    clue = 'Lists use square brackets <code>[item1, item2]</code> and items are indexed starting at 0.';
  } else if (code.includes('{') && code.includes('}')) {
    clue = 'Dictionaries store key-value pairs like <code>{"key": "value"}</code>. Access items with <code>dict["key"]</code>.';
  } else {
    clue = `Look at the example above. You can adapt the code: <code>${syntax.split('\n')[0] || ''}</code>. Change the values and run it!`;
  }
  return clue;
}

console.log('Testing generateLessonHint...');
const testLesson1 = { code: 'print("Hello world")', syntax: 'print(value)' };
console.log('Test 1:', generateLessonHint(testLesson1));

const testLesson2 = { code: 'name = input("Name: ")\nprint(f"Hi {name}")', syntax: 'input()' };
console.log('Test 2:', generateLessonHint(testLesson2));

const testLesson3 = { code: 'if x > 5:\n    print("Big")', syntax: 'if condition:' };
console.log('Test 3:', generateLessonHint(testLesson3));

console.log('✅ Hint generation logic verified!');
