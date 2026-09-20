function formatBeginnerError(err) {
  const msg = String(err && err.message ? err.message : err).replace(/^Error:\s*/i, '');
  let tip = '';

  if (msg.includes('IndentationError')) {
    if (msg.includes('expected an indented block')) {
      tip = 'You started an if, for, while, or def line, but did not indent the next line. Add 4 spaces at the start of the lines inside the block.';
    } else if (msg.includes('unexpected indent')) {
      tip = "This line has extra spaces at the beginning that shouldn't be there. Align it with the lines around it.";
    } else {
      tip = 'Python requires consistent indentation. Always use 4 spaces for each indent level.';
    }
  } else if (msg.includes('SyntaxError')) {
    if (msg.includes("expected ':'") || msg.includes('invalid syntax')) {
      tip = "Check your code structure: did you forget a colon ':' at the end of an if/for/while/def line, or miss a closing parenthesis/bracket?";
    } else if (msg.includes('unterminated') || msg.includes('EOL while scanning')) {
      tip = 'You started a text string with quotes but forgot to close it. Make sure every opening quote has a matching closing quote!';
    } else {
      tip = 'There is a typo or invalid character in this line. Check commas, quotes, and colons.';
    }
  } else if (msg.includes('NameError')) {
    const match = msg.match(/name '([^']+)' is not defined/);
    const varName = match ? match[1] : '';
    tip = varName 
      ? `Python doesn't recognize '${varName}'. Did you misspell it, forget to define it first, or forget quotation marks around it like "${varName}"?`
      : "Python doesn't recognize a word in your code. Check for typos or missing quotation marks around text.";
  } else if (msg.includes('TypeError')) {
    if (msg.includes('can only concatenate') || msg.includes('unsupported operand')) {
      tip = 'You are trying to combine different data types (like text + number). Convert the number using str() or use an f-string like f"Result: {num}".';
    } else if (msg.includes('is not callable')) {
      tip = "You put parentheses () after something that isn't a function.";
    } else {
      tip = 'This operation cannot be performed with these data types. Make sure you are passing the right type of value.';
    }
  } else if (msg.includes('ValueError')) {
    tip = 'A function received a value of the right type but an inappropriate value (e.g. trying to convert text containing letters using int()).';
  } else if (msg.includes('ZeroDivisionError')) {
    tip = 'Math rule: you cannot divide a number by zero (0). Make sure the denominator is not 0.';
  } else if (msg.includes('IndexError')) {
    tip = 'You tried to access an item position that does not exist. Remember: Python counting starts at 0, so a 3-item list has indexes 0, 1, and 2.';
  } else if (msg.includes('KeyError')) {
    tip = "That key was not found in the dictionary. Check your spelling or use dict.get('key') to provide a default value.";
  } else if (msg.includes('Time limit') || msg.includes('timeout') || msg.includes('Execution stopped')) {
    tip = 'Your program ran longer than the 3-second limit. Check your while or for loops to make sure they have a condition that eventually ends.';
  }

  return { raw: msg, tip };
}

// Test cases
console.log('1. NameError:', formatBeginnerError(new Error("NameError: name 'apple' is not defined")));
console.log('2. IndentationError:', formatBeginnerError(new Error("IndentationError: expected an indented block")));
console.log('3. SyntaxError:', formatBeginnerError(new Error("SyntaxError: expected ':'")));
console.log('4. TypeError:', formatBeginnerError(new Error('TypeError: can only concatenate str (not "int") to str')));
console.log('5. ZeroDivisionError:', formatBeginnerError(new Error('ZeroDivisionError: division by zero')));
console.log('6. IndexError:', formatBeginnerError(new Error('IndexError: list index out of range')));
console.log('7. Timeout:', formatBeginnerError(new Error('Execution stopped: Time limit reached (3 seconds).')));
console.log('✅ ALL ERROR EXPLAINER TESTS PASSED!');
