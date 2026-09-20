// scratch/generate_simplified_curriculum.js
const fs = require('fs');
const path = require('path');

const currPath = path.join(__dirname, '..', 'server', 'curriculum.json');
const data = JSON.parse(fs.readFileSync(currPath, 'utf8'));

// Helper to craft tailored, ultra-simple beginner practice tasks
function getSimplifiedPractice(l) {
  const t = l.title;
  const c = l.code;

  // Level 0: Foundations
  if (t === 'Computers & Programs') {
    return 'Run the code to see "Hello, Python!". Then change the text inside quotes to your name (e.g. print("Hello, Alex!")) and run it again.';
  }
  if (t === 'Values & Data') {
    return 'Run the code to see the data types. Try printing the type of your lucky number (like type(7)) or type("Python")!';
  }
  if (t === 'Variables & State') {
    return 'Run the code to see score increase. Try changing the starting score to 50 or adding 10 instead of 5.';
  }
  if (t === 'Expressions & Operators') {
    return 'Run the code to see math calculations. Try calculating 25 * 4 or 100 - 35 in a new print statement!';
  }
  if (t === 'Input & Output') {
    return 'Run the code and enter your name in the input box below. Try changing the greeting message!';
  }
  if (t === 'Algorithms & Pseudocode') {
    return 'Run the step-by-step instructions. Try adding a 4th step printing "Step 4: Enjoy your achievement!".';
  }
  if (t === 'Debugging Mindset') {
    return 'Run the code to verify it works without errors. Try printing another message to confirm it runs smoothly.';
  }
  if (t === 'First Mini Program') {
    return 'Run your first mini program! Change the variables (like user name or score) to make it personal to you.';
  }

  // Level 1: Basics
  if (t === 'Python Syntax') {
    return 'Run the code to see Python syntax in action. Try changing the printed message or adding a new print() line.';
  }
  if (t === 'Numbers & Strings') {
    return 'Run the code to see string and number operations. Try changing the numbers or concatenating your own strings!';
  }
  if (t === 'Variables Deep Dive') {
    return 'Run the code to see variable reassignment. Try creating a new variable like greeting = "Hi" and printing it.';
  }
  if (t === 'Type Conversion') {
    return 'Run the code to see int() and str() in action. Try converting the string "123" into an integer and adding 7.';
  }
  if (t === 'String Methods') {
    return 'Run the code to see text transformation (.upper(), .lower()). Try converting your favorite hobby to uppercase!';
  }
  if (t === 'f-Strings & Formatting') {
    return 'Run the code to see f-string formatting. Try creating an f-string that prints: f"My favorite language is {language}".';
  }
  if (t === 'Comments & Style') {
    return 'Run the code. Try adding your own comment with # explaining what the program does, then run it again.';
  }
  if (t === 'Foundations Project') {
    return 'Run the program to see all foundational concepts working together. Customize the message with your own details!';
  }

  // Level 2: Control Flow
  if (t === 'Booleans & Comparison') {
    return 'Run the code to see True and False comparisons. Try checking if 10 > 5 or if 20 == 20.';
  }
  if (t === 'if, elif, else') {
    return 'Run the code to see the decision logic. Try changing the score or age variable to trigger a different branch!';
  }
  if (t === 'Logical Operators') {
    return 'Run the code with "and", "or", "not". Try changing the boolean values to see how the conditions evaluate.';
  }
  if (t === 'while Loops') {
    return 'Run the loop. Try changing the starting counter to 1 and make the loop count up to 10!';
  }
  if (t === 'for Loops & range()') {
    return 'Run the for loop. Try changing range(5) to range(1, 6) to print numbers 1 through 5.';
  }
  if (t === 'break & continue') {
    return 'Run the code to see loop interruption. Try changing the break condition value to see when it stops.';
  }
  if (t === 'Nested Flow') {
    return 'Run the nested code. Try changing the inner numbers to see how the nested loops or conditions behave.';
  }
  if (t === 'Control Flow Project') {
    return 'Run the project to see the loop and conditional game/logic run. Change the secret number or input to test it!';
  }

  // Level 3: Functions
  if (t === 'Defining Functions') {
    return 'Run the code to call the function. Try calling the function with a different argument, like greet("Sara")!';
  }
  if (t === 'Parameters & Arguments') {
    return 'Run the function with parameters. Try passing two different numbers or strings and check the output.';
  }
  if (t === 'Return Values') {
    return 'Run the function to see what it returns. Try storing the returned value in a variable and printing it with a label.';
  }
  if (t === 'Default & Keyword Args') {
    return 'Run the code with default arguments. Try calling the function both with and without passing the optional argument.';
  }
  if (t === 'Scope & Lifetime') {
    return 'Run the code to see local vs global scope. Try declaring a new local variable inside the function and printing it.';
  }
  if (t === '*args and **kwargs') {
    return 'Run the code to see flexible arguments. Try passing 4 numbers into *args to see them all processed.';
  }
  if (t === 'Docstrings & Design') {
    return 'Run the documented function. Try reading the docstring or calling help() on it to see the help text.';
  }
  if (t === 'Functions Project') {
    return 'Run the modular function project. Try adding a helper function or testing it with new sample inputs!';
  }

  // Level 4: Data Structures
  if (t === 'Lists Basics') {
    return 'Run the code to see list items. Try adding a new item with .append("newItem") and printing the list.';
  }
  if (t === 'List Methods') {
    return 'Run the list operations (.append, .pop, .sort). Try sorting a list of your favorite numbers!';
  }
  if (t === 'Tuples & Immutability') {
    return 'Run the tuple example. Notice how tuples use parentheses () and cannot be modified. Try accessing the first element with tuple[0].';
  }
  if (t === 'Dictionaries Basics') {
    return 'Run the dictionary example. Try adding a new key-value pair like user["city"] = "Paris" and print the dictionary.';
  }
  if (t === 'Dictionary Iteration') {
    return 'Run the loop over keys and values using .items(). Try adding another key-value pair to the dictionary!';
  }
  if (t === 'Sets & Uniqueness') {
    return 'Run the set example. Notice how duplicate items are automatically removed! Try adding a duplicate number to see.';
  }
  if (t === 'Nested Structures') {
    return 'Run the nested list/dict code. Try accessing a deeply nested value like data[0]["name"] and printing it.';
  }
  if (t === 'Data Structures Project') {
    return 'Run the inventory/record manager. Try adding a new record to the list of dictionaries and printing the total count!';
  }

  // Level 5: Algorithms
  if (t.includes('Searching')) return 'Run the search algorithm. Try searching for a different number in the list to see if it is found.';
  if (t.includes('Sorting')) return 'Run the sorting code. Try passing in an unsorted list like [9, 2, 8, 1, 5] to see it sorted.';
  if (t.includes('Two-Pointer')) return 'Run the two-pointer loop. Observe how left and right indices move inward toward each other.';
  if (t.includes('Frequency')) return 'Run the frequency counter. Try adding more repeated words to the string to see their count update.';
  if (t.includes('Algorithms Project')) return 'Run the search & algorithm project. Test it with target values that exist and do not exist.';

  // General fallback for all remaining lessons:
  return `Run the code to see ${t} in action! Experiment by changing the values, adding a new print() check, or testing your own input.`;
}

console.log('Testing sample simplified questions:');
data.lessons.slice(0, 10).forEach(l => {
  console.log(`${l.id}: ${getSimplifiedPractice(l)}`);
});
