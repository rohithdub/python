// scratch/update_all_practice_questions.js
const fs = require('fs');
const path = require('path');

function getFriendlyPractice(lesson) {
  const { id, title, code, level } = lesson;
  const c = code || '';

  // Level 0: Absolute Beginner Foundations
  if (id === 'L0_1') return 'Run the code to see "Hello, Python!". Then change the text inside quotes to your name or greeting (e.g. print("Hello, Alex!")) and click Run practice.';
  if (id === 'L0_2') return 'Run the code to see Python data types. Try printing the type of your favorite number like type(100) or decimal like type(9.99).';
  if (id === 'L0_3') return 'Run the code to see the score change. Try changing the starting score to 50, or increase it by 10 instead of 5.';
  if (id === 'L0_4') return 'Run the code to see math calculations. Try calculating 25 * 4 or 100 - 35 in a new print() statement.';
  if (id === 'L0_5') return 'Run the code and enter your name in the input box below. Try changing the greeting message!';
  if (id === 'L0_6') return 'Run the step-by-step instructions. Try adding a 4th step printing "Step 4: Practice complete!".';
  if (id === 'L0_7') return 'Run the code to verify it runs without errors. Try printing an extra celebratory message!';
  if (id === 'L0_8') return 'Run your first mini program! Change the variables (like user name or score) to make it personal to you.';

  // Level 1: Python Basics
  if (id === 'L1_1') return 'Run the code to see Python syntax. Try adding a second print("I am learning Python!") statement.';
  if (id === 'L1_2') return 'Run the code to see number and string operations. Try changing the numbers or combining your own words.';
  if (id === 'L1_3') return 'Run the code to see variable updates. Try creating a new variable like greeting = "Welcome" and printing it.';
  if (id === 'L1_4') return 'Run the code to see type conversion with int() and str(). Try converting a new string number like "50" into an integer.';
  if (id === 'L1_5') return 'Run the code to see string methods like .upper(). Try converting your favorite city or food to uppercase!';
  if (id === 'L1_6') return 'Run the code to see f-string formatting. Try writing an f-string with your own name and favorite hobby.';
  if (id === 'L1_7') return 'Run the code. Try adding a comment starting with # explaining what line 1 does, then run it again.';
  if (id === 'L1_8') return 'Run the foundations project. Customize the printed details with your own personal statistics!';

  // Level 2: Control Flow & Logic
  if (id === 'L2_1') return 'Run the code to see True and False comparison results. Try checking if 15 > 10 or if 50 == 50.';
  if (id === 'L2_2') return 'Run the code to see if/else branching. Try changing the score or age variable to see a different branch execute.';
  if (id === 'L2_3') return 'Run the code using and, or, not. Try changing the boolean values to see how the condition evaluates.';
  if (id === 'L2_4') return 'Run the while loop. Try changing the loop limit to count up to 10 instead of 5.';
  if (id === 'L2_5') return 'Run the for loop. Try changing range(5) to range(1, 11) to print numbers 1 through 10.';
  if (id === 'L2_6') return 'Run the code to see break and continue. Try changing the target number where the loop stops.';
  if (id === 'L2_7') return 'Run the nested code. Try changing the loop numbers to print a different multiplication or grid pattern.';
  if (id === 'L2_8') return 'Run the control flow project. Try changing the test values or conditions to see how the program responds.';

  // Level 3: Functions & Scope
  if (id === 'L3_1') return 'Run the code to call the function. Try calling greet() with a different friend’s name!';
  if (id === 'L3_2') return 'Run the function with parameters. Try passing two different numbers to see their combined result.';
  if (id === 'L3_3') return 'Run the code to see return values. Try saving the returned answer in a variable and printing it.';
  if (id === 'L3_4') return 'Run the code with default arguments. Try calling the function both with and without the optional parameter.';
  if (id === 'L3_5') return 'Run the code to see local vs global variables. Try changing the local variable inside the function.';
  if (id === 'L3_6') return 'Run the code to see *args and **kwargs. Try passing 3 or 4 extra values into the function call.';
  if (id === 'L3_7') return 'Run the code to see docstrings. Try adding a line to print the function docstring with print(function_name.__doc__).';
  if (id === 'L3_8') return 'Run the functions project. Try calling the main functions with your own test data.';

  // Level 4: Data Structures
  if (id === 'L4_1') return 'Run the code to see list items. Try adding a new item with .append("newItem") and print the updated list.';
  if (id === 'L4_2') return 'Run the code to see list methods. Try sorting or reversing a list of numbers!';
  if (id === 'L4_3') return 'Run the tuple code. Notice that tuples cannot be modified. Try accessing tuple[0] to see the first item.';
  if (id === 'L4_4') return 'Run the dictionary code. Try adding a new key-value pair like user["city"] = "Tokyo" and print it.';
  if (id === 'L4_5') return 'Run the dictionary loop. Try printing each key and value using a formatted f-string.';
  if (id === 'L4_6') return 'Run the set example. Notice duplicate numbers are automatically removed! Try adding another duplicate.';
  if (id === 'L4_7') return 'Run the nested data structure code. Try accessing one of the nested values and printing it.';
  if (id === 'L4_8') return 'Run the data structures project. Try adding your own entry to the collection and running it.';

  // Level 5: Algorithms & Patterns
  if (id === 'L5_1') return 'Run the linear search code. Try searching for a different number to see if its index is found.';
  if (id === 'L5_2') return 'Run the binary search code. Try changing the target number to an item at the beginning or end of the list.';
  if (id === 'L5_3') return 'Run the recursion code. Try calling the function with a smaller number like 3 or 4.';
  if (id === 'L5_4') return 'Run the accumulator pattern. Try changing the numbers in the list to calculate a new total.';
  if (id === 'L5_5') return 'Run the sorting code. Try passing reverse=True to sort the numbers in descending order.';
  if (id === 'L5_6') return 'Run the two-pointer loop. Watch how the pointers step toward each other from both ends.';
  if (id === 'L5_7') return 'Run the frequency counter. Try adding more repeated words to the text to see the count update.';
  if (id === 'L5_8') return 'Run the algorithms project. Test it with inputs that are present and inputs that are absent.';

  // Level 6: Intermediate Python
  if (id === 'L6_1') return 'Run the exception handling code. Enter a valid number, then run again with 0 to see ZeroDivisionError handled gracefully.';
  if (id === 'L6_2') return 'Run the code to see math module imports. Try computing math.pow(2, 5) or math.floor(4.7).';
  if (id === 'L6_3') return 'Run the file writing and reading code. Try changing the text written to notes.txt.';
  if (id === 'L6_4') return 'Run the JSON serialization code. Try adding a new field like "role": "developer" to the data dictionary.';
  if (id === 'L6_5') return 'Run the date/time code. Try calculating the date 30 days into the future using timedelta(days=30).';
  if (id === 'L6_6') return 'Run the generator function. Try changing the limit to generate squares up to 6.';
  if (id === 'L6_7') return 'Run the context manager code. Try changing the label text to see how enter and exit messages print.';
  if (id === 'L6_8') return 'Run the intermediate project. Try adding an extra expense item to the saved data.';

  // Level 7: Object-Oriented Programming (OOP)
  if (id === 'L7_1') return 'Run the class and object code. Try creating a second student object like s2 = Student("Maya") and call greet()!';
  if (id === 'L7_2') return 'Run the constructor example. Try creating a new Course object with your own title and lesson count.';
  if (id === 'L7_3') return 'Run the counter class methods. Try calling increment() multiple times and printing the final value.';
  if (id === 'L7_4') return 'Run the inheritance code. Try creating another child class like Cat(Animal) that speaks "meow".';
  if (id === 'L7_5') return 'Run the polymorphism loop. Try adding a new animal class with a speak() method to the list.';
  if (id === 'L7_6') return 'Run the dataclass code. Try instantiating another Product with your own name and price.';
  if (id === 'L7_7') return 'Run the composition example. Notice how Car contains an Engine object. Try calling the engine start method.';
  if (id === 'L7_8') return 'Run the OOP project. Try borrowing a book twice to verify that the second attempt returns False.';

  // Level 8: Advanced Python
  if (id === 'L8_1') return 'Run the type-annotated function. Try passing different floating point numbers and observe the result.';
  if (id === 'L8_2') return 'Run the list comprehension. Try modifying the condition or creating your own comprehension for squared numbers.';
  if (id === 'L8_3') return 'Run the map() and lambda function. Try using filter() to only keep numbers greater than 2.';
  if (id === 'L8_4') return 'Run the regular expression search. Try matching different patterns or adding more IDs to the text.';
  if (id === 'L8_5') return 'Run the thread pool executor. Try adding more numbers to the map list to see concurrent processing.';
  if (id === 'L8_6') return 'Run the asyncio task. Try scheduling a second async greeting with a different sleep time.';
  if (id === 'L8_7') return 'Run the performance timer. Try running the loop with 200,000 items to see how elapsed time scales.';
  if (id === 'L8_8') return 'Run the advanced project. Try parsing different log message samples to check the frequency counts.';

  // Level 9: Real-World Python
  if (id === 'L9_1') return 'Run the CLI argument script. Observe how argument parsing is configured in standard Python apps.';
  if (id === 'L9_2') return 'Run the environment variable check. Try changing the default fallback value in os.getenv().';
  if (id === 'L9_3') return 'Run the unit test code. Try adding a second test method that checks negative numbers like add(-2, 3) == 1.';
  if (id === 'L9_4') return 'Run the logging code. Try adding an error log using logging.error("Sample error message").';
  if (id === 'L9_5') return 'Run the HTTP API demonstration. Review the structure used to fetch and read web responses.';
  if (id === 'L9_6') return 'Run the data cleaning pipeline. Try adding another score record to calculate the updated average.';
  if (id === 'L9_7') return 'Run the package structure viewer. Try adding a "docs/" folder entry to the project dictionary.';
  if (id === 'L9_8') return 'Run the real-world task manager project. Try toggling the task status and printing the updated list.';

  // Level 10: Capstone & Engineering
  if (id === 'L10_1') return 'Run the milestone pipeline. Try adding a new milestone like "beta testing" to the roadmap list.';
  if (id === 'L10_2') return 'Run the clean code example. Try passing a list with both positive and negative values to verify filtering.';
  if (id === 'L10_3') return 'Run the architecture pipeline (validate -> run -> save). Try passing a string with leading whitespace.';
  if (id === 'L10_4') return 'Run the test assertion suite. Try adding a 4th assert clamp(50, 0, 100) == 50 to confirm it passes.';
  if (id === 'L10_5') return 'Run the input sanitization function. Try passing valid and invalid usernames to verify validation.';
  if (id === 'L10_6') return 'Run the Git workflow chain. Observe each stage of a professional software release pipeline.';
  if (id === 'L10_7') return 'Run the deployment configuration dictionary. Try adding an "environment": "production" key.';
  if (id === 'L10_8') return 'Run the capstone project checklist. Review the foundational architecture components of a complete Python application.';

  return `Run the code to see ${title} in action! Experiment by tweaking values, printing an extra check, or adding your own input.`;
}

// 1. Update server/curriculum.json
const currFile = path.join(__dirname, '..', 'server', 'curriculum.json');
const currData = JSON.parse(fs.readFileSync(currFile, 'utf8'));

currData.lessons.forEach(l => {
  l.practice = getFriendlyPractice(l);
});

fs.writeFileSync(currFile, JSON.stringify(currData, null, 2), 'utf8');
console.log('✅ Updated server/curriculum.json with friendly practice tasks!');

// 2. Update python-academy-complete/index.html
const indexFile = path.join(__dirname, '..', 'python-academy-complete', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Replace the LESSONS array in index.html
const m = html.match(/const LESSONS\s*=\s*(\[[\s\S]*?\]);\s*const CHALLENGES/);
if (m) {
  const lessons = JSON.parse(m[1]);
  lessons.forEach(l => {
    l.practice = getFriendlyPractice(l);
  });
  const newLessonsStr = 'const LESSONS = ' + JSON.stringify(lessons) + ';\nconst CHALLENGES';
  html = html.replace(m[0], newLessonsStr);
  console.log('✅ Replaced LESSONS array in index.html with friendly practice tasks!');
} else {
  console.error('❌ Could not find LESSONS match in index.html');
  process.exit(1);
}

// 3. Update runPractice in index.html to accept code without "modify starter" blocking
const oldRunPracticeRegex = /async function runPractice\(id\)\{[\s\S]*?result\.className='status bad';\s*result\.textContent='Modify the starter example first, then run your own version\.'[\s\S]*?try\{/i;

const newRunPracticeHeader = `async function runPractice(id){
  const l=lessonById(id),
        code=document.getElementById('practice-code-'+id)?.value||'',
        input=document.getElementById('practice-input-'+id)?.value||'',
        result=document.getElementById('practice-result-'+id);

  if(!code.trim()){
    result.className='status bad';
    result.textContent='Write or run some Python code before running practice.';
    return;
  }

  state.practiceCode[id]=code;
  state.practiceInput[id]=input;
  localStorage.setItem(KEY,JSON.stringify(state));
  result.className='status';
  result.textContent='Running your code…';

  try{`;

if (oldRunPracticeRegex.test(html)) {
  html = html.replace(oldRunPracticeRegex, newRunPracticeHeader);
  console.log('✅ Removed "modify starter" blocking check from runPractice!');
} else {
  console.warn('⚠️ Could not match oldRunPracticeRegex, searching alternative...');
  // Let's check manual string replace
  const targetSnippet = "if(code.trim()===l.code.trim()){result.className='status bad';result.textContent='Modify the starter example first, then run your own version.';return;}";
  if (html.includes(targetSnippet)) {
    html = html.replace(targetSnippet, "// Accepted directly without blocking");
    console.log('✅ Removed exact targetSnippet from runPractice!');
  } else {
    console.error('❌ Could not find targetSnippet in index.html');
  }
}

// Save updated index.html
fs.writeFileSync(indexFile, html, 'utf8');
console.log('✅ Successfully wrote updated index.html!');
