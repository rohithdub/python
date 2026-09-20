// scratch/generate_simple_quizzes.js
const fs = require('fs');
const path = require('path');

const QUIZZES = {
  // Level 0: Foundations
  'L0_1': [
    { q: 'Which Python function displays text or numbers on the screen?', options: ['print()', 'input()', 'show()', 'echo()'], answer: 0 },
    { q: 'How do you represent a text string in Python?', options: ['Inside quotes like "Hello"', 'Inside angle brackets <Hello>', 'Inside dollar signs $Hello$', 'With no quotes'], answer: 0 }
  ],
  'L0_2': [
    { q: 'What data type is the whole number 42 in Python?', options: ['int (integer)', 'float', 'str (string)', 'bool (boolean)'], answer: 0 },
    { q: 'Which of these represents a True or False value?', options: ['bool', 'str', 'int', 'list'], answer: 0 }
  ],
  'L0_3': [
    { q: 'How do you create a variable called score and set it to 10?', options: ['score = 10', 'var score := 10', 'int score == 10', 'set score to 10'], answer: 0 },
    { q: 'What happens when you reassign an existing variable with a new value?', options: ['The variable updates to store the new value', 'Python throws a syntax error', 'Both values are merged', 'The computer reboots'], answer: 0 }
  ],
  'L0_4': [
    { q: 'What symbol is used for multiplication in Python?', options: ['*', 'x', '•', '^'], answer: 0 },
    { q: 'What is the result of 10 + 2 * 3 in Python?', options: ['16 (multiplication happens before addition)', '36', '24', '15'], answer: 0 }
  ],
  'L0_5': [
    { q: 'Which function is used to capture user keyboard input?', options: ['input()', 'read()', 'scan()', 'get()'], answer: 0 },
    { q: 'What type of data does the input() function return by default?', options: ['str (string / text)', 'int (integer)', 'bool (boolean)', 'float (decimal)'], answer: 0 }
  ],
  'L0_6': [
    { q: 'What is an algorithm in computer programming?', options: ['A step-by-step set of instructions to solve a problem', 'A type of computer hardware', 'A programming error', 'A secret password'], answer: 0 },
    { q: 'Why is planning with pseudocode helpful before coding?', options: ['It clarifies the logic before worrying about exact syntax', 'It makes Python execute faster', 'It replaces the need for testing', 'It is required by the computer'], answer: 0 }
  ],
  'L0_7': [
    { q: 'What is debugging in programming?', options: ['Finding and fixing mistakes or bugs in your code', 'Deleting the entire program', 'Buying a new computer', 'Turning off the monitor'], answer: 0 },
    { q: 'When Python shows an error message, what should you do first?', options: ['Read the error type and line number carefully', 'Guess randomly and change unrelated lines', 'Close the editor immediately', 'Ignore the message'], answer: 0 }
  ],
  'L0_8': [
    { q: 'What is a key benefit of combining variables and print() statements?', options: ['You can create dynamic programs that display personalized results', 'It encrypts your code', 'It prevents all errors permanently', 'It makes Python run backwards'], answer: 0 },
    { q: 'What character indicates a single-line comment in Python?', options: ['#', '//', '/*', '<!--'], answer: 0 }
  ],

  // Level 1: Basics
  'L1_1': [
    { q: 'How does Python determine which lines belong inside a code block?', options: ['Indentation (spaces at the start of lines)', 'Curly braces {}', 'Semicolons ;', 'Parentheses ()'], answer: 0 },
    { q: 'How many spaces are standard for each indentation level in Python?', options: ['4 spaces', '1 space', '10 spaces', '8 spaces'], answer: 0 }
  ],
  'L1_2': [
    { q: 'What is the difference between 5 and "5" in Python?', options: ['5 is an integer (number), while "5" is a string (text)', 'They are completely identical', '"5" is a float', '5 is invalid syntax'], answer: 0 },
    { q: 'What happens when you add two strings: "Py" + "thon"?', options: ['"Python" (concatenation)', 'Error', '0', '"Py thon"'], answer: 0 }
  ],
  'L1_3': [
    { q: 'Which string method converts all letters to uppercase?', options: ['.upper()', '.capitalize()', '.toUpper()', '.big()'], answer: 0 },
    { q: 'What does the .strip() method do to a string?', options: ['Removes leading and trailing whitespace', 'Reverses the string', 'Deletes all vowels', 'Counts the words'], answer: 0 }
  ],
  'L1_4': [
    { q: 'How do you convert the text string "25" into a number for math?', options: ['int("25")', 'str(25)', 'to_number("25")', 'parse("25")'], answer: 0 },
    { q: 'What happens if you try to convert int("hello")?', options: ['Python raises a ValueError', 'It converts to 0', 'It ignores the letters', 'It converts to 100'], answer: 0 }
  ],
  'L1_5': [
    { q: 'Which operator checks if two values are equal in Python?', options: ['==', '=', '!=', '==='], answer: 0 },
    { q: 'What does 10 >= 10 evaluate to?', options: ['True', 'False', 'None', 'Error'], answer: 0 }
  ],
  'L1_6': [
    { q: 'What index does Python use for the very first item of a sequence?', options: ['0', '1', '-1', 'first'], answer: 0 },
    { q: 'Which function returns the total number of characters in a string or items in a list?', options: ['len()', 'size()', 'count()', 'total()'], answer: 0 }
  ],
  'L1_7': [
    { q: 'How do you format variables into text using an f-string?', options: ['f"Hello, {name}!"', '"Hello, {name}!"', 'f"Hello, [name]!"', 'format("Hello", name)'], answer: 0 },
    { q: 'What prefix letter is placed before quotes to create an f-string?', options: ['f or F', 's', 'str', '$'], answer: 0 }
  ],
  'L1_8': [
    { q: 'Why is writing modular, well-named code important?', options: ['It makes code easier for humans to read, debug, and maintain', 'It makes the file size larger', 'It is required by the operating system', 'It hides code from users'], answer: 0 },
    { q: 'What is a good way to test that your program works as expected?', options: ['Run it with different sample inputs and verify the output', 'Assume it works without running it', 'Delete the comments', 'Change random lines'], answer: 0 }
  ],

  // Level 2: Control Flow
  'L2_1': [
    { q: 'Which keyword is used to test an alternative condition if the first if is False?', options: ['elif', 'else if', 'elseif', 'then'], answer: 0 },
    { q: 'What character must follow every if, elif, and else line?', options: [': (colon)', '; (semicolon)', '{ (brace)', ', (comma)'], answer: 0 }
  ],
  'L2_2': [
    { q: 'What is a nested decision in Python?', options: ['An if statement placed inside another if statement', 'A decision with no conditions', 'A loop that never runs', 'An error in syntax'], answer: 0 },
    { q: 'How many indentation levels does the body of a nested if statement have?', options: ['2 levels (8 spaces)', '1 level (4 spaces)', '0 levels', '3 spaces'], answer: 0 }
  ],
  'L2_3': [
    { q: 'What does range(3) generate in a for loop?', options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '3, 2, 1'], answer: 0 },
    { q: 'Which loop is best when you know in advance how many items to process?', options: ['for loop', 'while loop', 'do-while loop', 'infinite loop'], answer: 0 }
  ],
  'L2_4': [
    { q: 'When does a while loop stop repeating?', options: ['When its condition evaluates to False', 'After exactly 10 runs', 'When the computer runs out of memory', 'It never stops'], answer: 0 },
    { q: 'What happens if a while loop condition never becomes False?', options: ['An infinite loop occurs', 'Python automatically exits after 1 second', 'The program deletes itself', 'A syntax error appears'], answer: 0 }
  ],
  'L2_5': [
    { q: 'Which keyword immediately exits and stops the current loop?', options: ['break', 'continue', 'pass', 'stop'], answer: 0 },
    { q: 'Which keyword skips the rest of the current iteration and moves to the next one?', options: ['continue', 'break', 'skip', 'next'], answer: 0 }
  ],
  'L2_6': [
    { q: 'What is an accumulator variable in a loop pattern?', options: ['A variable that gathers or sums up values as the loop runs', 'A loop that runs backwards', 'An error counter', 'A type of list'], answer: 0 },
    { q: 'How can you keep track of both the index and item in a for loop?', options: ['Using enumerate(items)', 'Using count(items)', 'Using index(items)', 'Using loop(items)'], answer: 0 }
  ],
  'L2_7': [
    { q: 'Why is testing loop boundary conditions (like 0 or empty lists) important?', options: ['Off-by-one errors and empty edge cases are common source of bugs', 'Loops fail on large numbers', 'Python requires boundary tests to compile', 'It makes loops run twice as fast'], answer: 0 },
    { q: 'What does pass do in an if statement or loop body?', options: ['Acts as a placeholder that does nothing', 'Exits the program', 'Prints "pass"', 'Restarts the loop'], answer: 0 }
  ],
  'L2_8': [
    { q: 'What makes a program interactive?', options: ['Responding to user inputs with conditional decisions and loops', 'Having lots of comments', 'Using only print statements', 'Running in the background'], answer: 0 },
    { q: 'What is a good way to structure a text-based menu loop?', options: ['A while loop that keeps running until the user enters an exit choice', 'A single if statement', 'Ten nested for loops', 'A list of strings with no loop'], answer: 0 }
  ],

  // Level 3: Data Structures (Lists, Tuples, Sets, Dicts)
  'L3_1': [
    { q: 'Which brackets are used to define a list in Python?', options: ['Square brackets []', 'Curly braces {}', 'Parentheses ()', 'Angle brackets <>'], answer: 0 },
    { q: 'What is the index of the last element in a Python list?', options: ['-1', '0', 'last', '100'], answer: 0 }
  ],
  'L3_2': [
    { q: 'Which method adds a single item to the end of a list?', options: ['.append()', '.add()', '.push()', '.insert_last()'], answer: 0 },
    { q: 'Which method removes and returns the last item from a list?', options: ['.pop()', '.remove()', '.delete()', '.shift()'], answer: 0 }
  ],
  'L3_3': [
    { q: 'What is the main difference between a list and a tuple?', options: ['Tuples are immutable (cannot be changed after creation)', 'Tuples cannot store numbers', 'Tuples use square brackets', 'Lists are faster than tuples'], answer: 0 },
    { q: 'Which brackets are used to define a tuple?', options: ['Parentheses ()', 'Square brackets []', 'Curly braces {}', 'Angle brackets <>'], answer: 0 }
  ],
  'L3_4': [
    { q: 'What is a special property of a Python set?', options: ['All elements must be unique (no duplicates)', 'Elements are stored in sorted order', 'Elements can be accessed by index', 'Sets can only store strings'], answer: 0 },
    { q: 'Which method adds an element to a set?', options: ['.add()', '.append()', '.push()', '.insert()'], answer: 0 }
  ],
  'L3_5': [
    { q: 'What structure does a Python dictionary store data in?', options: ['Key-value pairs', 'Indexed items only', 'Ordered numbers', 'True/False values only'], answer: 0 },
    { q: 'How do you look up the value for the key "age" in a dictionary called person?', options: ['person["age"]', 'person(age)', 'person.index("age")', 'person{age}'], answer: 0 }
  ],
  'L3_6': [
    { q: 'What is a nested collection?', options: ['A list of dictionaries or dictionary of lists', 'A variable with two names', 'An infinite loop', 'A function inside a comment'], answer: 0 },
    { q: 'Given data = [{"score": 90}], how do you get the score?', options: ['data[0]["score"]', 'data["score"][0]', 'data(0)(score)', 'data.score[0]'], answer: 0 }
  ],
  'L3_7': [
    { q: 'What is a list comprehension in Python?', options: ['A concise, elegant syntax to create a new list from an iterable', 'A way to delete lists', 'A tool to compress file size', 'A sorting algorithm'], answer: 0 },
    { q: 'What does [x * 2 for x in [1, 2, 3]] produce?', options: ['[2, 4, 6]', '[1, 2, 3]', '[1, 4, 9]', '[2, 2, 2]'], answer: 0 }
  ],
  'L3_8': [
    { q: 'Why choose a dictionary over a list for user profiles?', options: ['Dictionaries allow looking up attributes by descriptive keys like "email"', 'Lists cannot store text', 'Dictionaries use less memory', 'Lists can only hold 10 items'], answer: 0 },
    { q: 'Which method safely retrieves a dictionary value without throwing a KeyError?', options: ['dict.get("key", default)', 'dict.find("key")', 'dict["key"]', 'dict.search("key")'], answer: 0 }
  ],

  // Level 4: Functions & Scope
  'L4_1': [
    { q: 'Which keyword is used to define a function in Python?', options: ['def', 'func', 'function', 'fn'], answer: 0 },
    { q: 'How do you execute (call) a function named greet?', options: ['greet()', 'call greet', 'def greet', 'run greet'], answer: 0 }
  ],
  'L4_2': [
    { q: 'What is a parameter in a function definition?', options: ['A placeholder variable defined in the function signature to accept input', 'The output of the function', 'A comment line', 'The name of the file'], answer: 0 },
    { q: 'In def add(a, b): what are a and b?', options: ['Parameters', 'Return values', 'Global variables', 'Keywords'], answer: 0 }
  ],
  'L4_3': [
    { q: 'Which keyword is used to send a value back from a function to its caller?', options: ['return', 'send', 'output', 'give'], answer: 0 },
    { q: 'What does a Python function return by default if there is no return statement?', options: ['None', '0', 'False', '""'], answer: 0 }
  ],
  'L4_4': [
    { q: 'Can a variable created inside a function be accessed directly outside of it?', options: ['No, it has local scope inside the function', 'Yes, all variables are global', 'Only if it is a number', 'Only in Windows'], answer: 0 },
    { q: 'Which keyword allows modifying a global variable from inside a function?', options: ['global', 'public', 'outer', 'export'], answer: 0 }
  ],
  'L4_5': [
    { q: 'What is a lambda in Python?', options: ['A small anonymous function defined on a single line', 'A mathematical constant', 'A built-in module for networking', 'A loop statement'], answer: 0 },
    { q: 'Which function applies a given function to all items in an iterable?', options: ['map()', 'each()', 'apply()', 'loop()'], answer: 0 }
  ],
  'L4_6': [
    { q: 'What is recursion in programming?', options: ['When a function calls itself to solve smaller subproblems', 'A loop that cannot stop', 'A syntax error', 'Importing two modules together'], answer: 0 },
    { q: 'What is the base case in a recursive function?', options: ['The condition that stops the recursion from continuing infinitely', 'The very first line of Python', 'The largest number in a list', 'The print statement'], answer: 0 }
  ],
  'L4_7': [
    { q: 'What is the Single Responsibility Principle for functions?', options: ['A function should focus on doing one clear task well', 'Every file can only have one function', 'A function can only take one parameter', 'A function must never return a value'], answer: 0 },
    { q: 'Where should a docstring be placed in a function?', options: ['Immediately after the def line as a triple-quoted string', 'At the very end of the file', 'Inside the return statement', 'In a separate text file'], answer: 0 }
  ],
  'L4_8': [
    { q: 'What is the main benefit of modular programming with functions?', options: ['Code reuse, easier debugging, and clear organization', 'Faster computer boot times', 'Smaller font sizes', 'Automatic cloud synchronization'], answer: 0 },
    { q: 'How do you write test calls to verify your functions?', options: ['Call the function with expected arguments and assert or print the result', 'Assume the function works', 'Delete the function after writing', 'Never pass arguments'], answer: 0 }
  ],

  // Level 5: Algorithms & Patterns
  'L5_1': [
    { q: 'What does problem decomposition mean?', options: ['Breaking down a large, complex problem into smaller manageable parts', 'Deleting old code files', 'Speeding up internet speeds', 'Compiling code to machine language'], answer: 0 },
    { q: 'Why is planning inputs and outputs before coding helpful?', options: ['It defines what each part must achieve before writing details', 'It eliminates the need for Python', 'It prevents all syntax errors', 'It saves hard drive space'], answer: 0 }
  ],
  'L5_2': [
    { q: 'What does Big O notation describe in computer science?', options: ['How an algorithm’s runtime or memory scales with input size', 'The file size in kilobytes', 'The version of Python installed', 'The number of comments in code'], answer: 0 },
    { q: 'What is the time complexity of looking up an item by key in a dictionary?', options: ['O(1) - constant time on average', 'O(N^2) - quadratic', 'O(N!) - factorial', 'O(log N)'], answer: 0 }
  ],
  'L5_3': [
    { q: 'How does Linear Search find a target item in a list?', options: ['Checks each item one by one from start to finish', 'Jumps directly to the middle', 'Requires the list to be sorted first', 'Uses binary division'], answer: 0 },
    { q: 'What is the worst-case time complexity of Linear Search for N items?', options: ['O(N)', 'O(1)', 'O(log N)', 'O(N^2)'], answer: 0 }
  ],
  'L5_4': [
    { q: 'What requirement must a list satisfy before you can use Binary Search?', options: ['The list must already be sorted', 'The list must contain only words', 'The list must have an odd length', 'The list cannot have numbers'], answer: 0 },
    { q: 'What is the time complexity of Binary Search?', options: ['O(log N)', 'O(N)', 'O(N^2)', 'O(1)'], answer: 0 }
  ],
  'L5_5': [
    { q: 'Which built-in function returns a new sorted list in Python?', options: ['sorted()', 'sort()', 'order()', 'arrange()'], answer: 0 },
    { q: 'How do you sort in descending order using sorted()?', options: ['sorted(items, reverse=True)', 'sorted(items, down=True)', 'reverse(sorted(items))', 'sorted(items, -1)'], answer: 0 }
  ],
  'L5_6': [
    { q: 'How does the Two-Pointer technique work?', options: ['Uses two indices (e.g. left and right) that move toward each other or step forward', 'Uses two computers simultaneously', 'Runs two Python scripts at once', 'Creates two identical variables'], answer: 0 },
    { q: 'When is the two-pointer technique especially useful?', options: ['Searching or reversing elements in sorted arrays or palindrome checking', 'Formatting text strings', 'Printing debug logs', 'Importing modules'], answer: 0 }
  ],
  'L5_7': [
    { q: 'Which module provides the Counter class in Python?', options: ['collections', 'math', 'sys', 'itertools'], answer: 0 },
    { q: 'What does Counter(["a", "b", "a"]) return?', options: ['Counter({"a": 2, "b": 1})', '3', '["a", "b"]', 'True'], answer: 0 }
  ],
  'L5_8': [
    { q: 'What is an edge case in algorithm testing?', options: ['An unusual or extreme input (such as an empty list or single item) that tests code resilience', 'A line of code at the top of a file', 'A syntax typo', 'A variable with two letters'], answer: 0 },
    { q: 'Why is comparing your algorithm against test cases essential?', options: ['It proves your code works across both typical and boundary scenarios', 'It makes the code longer', 'It is required to run Python', 'It compiles the code to C'], answer: 0 }
  ],

  // Level 6: Intermediate Python
  'L6_1': [
    { q: 'Which block handles errors that occur inside a try block?', options: ['except', 'catch', 'error', 'handle'], answer: 0 },
    { q: 'Which block always runs, whether an error occurred or not?', options: ['finally', 'always', 'end', 'else'], answer: 0 }
  ],
  'L6_2': [
    { q: 'Which keyword brings in code from another Python file or library?', options: ['import', 'include', 'require', 'using'], answer: 0 },
    { q: 'How do you import only the sqrt function from the math module?', options: ['from math import sqrt', 'import sqrt in math', 'math.import(sqrt)', 'include math::sqrt'], answer: 0 }
  ],
  'L6_3': [
    { q: 'Which modern standard library module is recommended for working with file paths?', options: ['pathlib', 'os.disk', 'file_tools', 'directory'], answer: 0 },
    { q: 'How do you quickly read text from a Path object in Python 3?', options: ['path.read_text()', 'path.load()', 'path.getText()', 'read(path)'], answer: 0 }
  ],
  'L6_4': [
    { q: 'Which method converts a Python dictionary into a JSON string?', options: ['json.dumps()', 'json.loads()', 'json.stringify()', 'json.encode()'], answer: 0 },
    { q: 'Which method parses a JSON string back into a Python dictionary?', options: ['json.loads()', 'json.dumps()', 'json.parse()', 'json.decode()'], answer: 0 }
  ],
  'L6_5': [
    { q: 'Which module handles dates and times in Python?', options: ['datetime', 'time_tools', 'calendar_os', 'clock'], answer: 0 },
    { q: 'What object represents a duration or difference between two dates?', options: ['timedelta', 'timespan', 'duration', 'diff'], answer: 0 }
  ],
  'L6_6': [
    { q: 'Which keyword turns a regular function into a generator?', options: ['yield', 'generate', 'return_stream', 'emit'], answer: 0 },
    { q: 'What is a key benefit of using a generator over creating a huge list?', options: ['Generators produce values one by one in memory on demand (lazy evaluation)', 'Generators run in C++', 'Generators cannot have loops', 'Generators require no syntax'], answer: 0 }
  ],
  'L6_7': [
    { q: 'What symbol is used to apply a decorator to a function?', options: ['@', '#', '$', '&'], answer: 0 },
    { q: 'Which statement ensures clean setup and teardown (like closing files) using context managers?', options: ['with', 'using', 'open_block', 'manage'], answer: 0 }
  ],
  'L6_8': [
    { q: 'Why is persistent storage (like saving to JSON files) useful in applications?', options: ['It keeps user data and progress saved even after the program closes', 'It makes the program look cooler', 'It makes loops run faster', 'It prevents syntax errors'], answer: 0 },
    { q: 'How do you ensure files are saved with universal character encoding?', options: ['encoding="utf-8"', 'mode="ascii"', 'charset="default"', 'format="raw"'], answer: 0 }
  ],

  // Level 7: Object-Oriented Programming (OOP)
  'L7_1': [
    { q: 'What is a class in Python?', options: ['A blueprint for creating objects with shared attributes and behaviors', 'A collection of comments', 'A list of numbers', 'A type of for loop'], answer: 0 },
    { q: 'What is an instance of a class called?', options: ['An object', 'A method', 'A module', 'A package'], answer: 0 }
  ],
  'L7_2': [
    { q: 'What is the name of Python’s constructor method called when an object is created?', options: ['__init__', '__new__', '__construct__', '__start__'], answer: 0 },
    { q: 'What does the first parameter self represent in class methods?', options: ['The specific instance of the object being worked on', 'The parent class', 'The operating system', 'A global variable'], answer: 0 }
  ],
  'L7_3': [
    { q: 'What is encapsulation in OOP?', options: ['Bundling data and the methods that operate on that data inside a class', 'Writing all code on one line', 'Creating infinite objects', 'Importing libraries'], answer: 0 },
    { q: 'By convention, how do Python developers indicate an internal/private attribute?', options: ['With a leading underscore like _value', 'With the private keyword', 'With uppercase letters', 'With exclamation marks'], answer: 0 }
  ],
  'L7_4': [
    { q: 'How does a child class inherit from a parent class in Python?', options: ['class Child(Parent):', 'class Child inherits Parent:', 'class Child extends Parent:', 'class Child <- Parent:'], answer: 0 },
    { q: 'Which function allows a child class to call methods from its parent class?', options: ['super()', 'parent()', 'base()', 'upper()'], answer: 0 }
  ],
  'L7_5': [
    { q: 'What is polymorphism in object-oriented programming?', options: ['Different classes can define methods with the same name, allowing them to be used interchangeably', 'An object with many names', 'A loop that changes shape', 'Multiple inheritance errors'], answer: 0 },
    { q: 'If Cat and Dog both define speak(), what does [Cat(), Dog()] allow you to do?', options: ['Call .speak() on each animal in a single loop without caring about its exact class', 'Merge the animals into one object', 'Cause a Python error', 'Delete both animals'], answer: 0 }
  ],
  'L7_6': [
    { q: 'Which decorator simplifies creating classes that primarily store data?', options: ['@dataclass', '@schema', '@model', '@struct'], answer: 0 },
    { q: 'What does @dataclass automatically generate for you?', options: ['__init__, __repr__, and equality comparison methods', 'Database tables', 'User interface buttons', 'Network connections'], answer: 0 }
  ],
  'L7_7': [
    { q: 'What is composition in software design?', options: ['Building complex classes by combining simpler objects ("has-a" relationship)', 'Writing music in Python', 'Inheriting from 10 classes', 'Deleting old code'], answer: 0 },
    { q: 'Why is "favor composition over inheritance" common design advice?', options: ['It creates flexible, loosely-coupled components that are easier to test and change', 'Inheritance is deprecated in Python 3', 'Composition makes code run twice as fast', 'Inheritance requires internet access'], answer: 0 }
  ],
  'L7_8': [
    { q: 'In an OOP project, how do objects communicate with each other?', options: ['By calling each other’s methods and passing data as arguments', 'Through global text files', 'By changing monitor colors', 'Through internet downloads'], answer: 0 },
    { q: 'What is a good sign that your OOP design is clean?', options: ['Each class has a clear responsibility and methods operate on object state', 'Everything is written in one huge function', 'No classes have attributes', 'There are no methods'], answer: 0 }
  ],

  // Level 8: Advanced Python
  'L8_1': [
    { q: 'What do Python type hints (like name: str) provide?', options: ['Clarity for developers and static analysis tools without breaking runtime behavior', 'Strict compilation like C++', 'Faster CPU speeds', 'Automatic encryption'], answer: 0 },
    { q: 'How do you indicate that a function returns a float?', options: ['def get_total() -> float:', 'def get_total(): float', 'return: float', 'def float get_total():'], answer: 0 }
  ],
  'L8_2': [
    { q: 'What does [x for row in matrix for x in row] accomplish?', options: ['Flattens a 2D matrix into a 1D list', 'Multiplies the matrix by 2', 'Reverses the matrix', 'Counts the rows'], answer: 0 },
    { q: 'Can you use conditional if filtering inside a list comprehension?', options: ['Yes, like [x for x in items if x > 0]', 'No, comprehensions cannot have if', 'Only in Python 2', 'Only with numbers'], answer: 0 }
  ],
  'L8_3': [
    { q: 'Which function filters items from an iterable based on a condition?', options: ['filter()', 'clean()', 'remove_if()', 'strip()'], answer: 0 },
    { q: 'What does map(lambda x: x + 1, [1, 2, 3]) return?', options: ['An iterator that yields [2, 3, 4]', 'The number 6', 'A syntax error', '[1, 2, 3]'], answer: 0 }
  ],
  'L8_4': [
    { q: 'Which module handles regular expressions in Python?', options: ['re', 'regex_tools', 'pattern', 'text_search'], answer: 0 },
    { q: 'What does re.findall(r"\\d+", text) extract from a string?', options: ['All sequences of digits (numbers)', 'All uppercase words', 'All spaces', 'All punctuation'], answer: 0 }
  ],
  'L8_5': [
    { q: 'What does ThreadPoolExecutor allow you to do?', options: ['Run multiple independent tasks concurrently across worker threads', 'Stop the CPU', 'Create a new terminal', 'Compile Python to machine code'], answer: 0 },
    { q: 'When is multithreading in Python most effective?', options: ['For I/O-bound tasks like downloading web pages or reading files', 'For heavy pure CPU math calculations', 'For simple print statements', 'For writing comments'], answer: 0 }
  ],
  'L8_6': [
    { q: 'Which keyword defines an asynchronous coroutine in Python?', options: ['async def', 'coroutine def', 'thread def', 'await def'], answer: 0 },
    { q: 'Which keyword is used to pause execution until an async task finishes?', options: ['await', 'pause', 'wait_for', 'sleep'], answer: 0 }
  ],
  'L8_7': [
    { q: 'Which function from the time module provides high-precision performance timing?', options: ['time.perf_counter()', 'time.clock_now()', 'time.get_ms()', 'time.current()'], answer: 0 },
    { q: 'Why is profiling code before optimizing it important?', options: ['It reveals the true bottlenecks so you only optimize what matters', 'It makes code shorter', 'It compiles the script', 'It is required to run tests'], answer: 0 }
  ],
  'L8_8': [
    { q: 'What is the benefit of combining regular expressions and Counter in log analysis?', options: ['Quickly parses structured patterns and counts occurrences of error codes or IPs', 'Decreases file download time', 'Prevents web crashes', 'Replaces operating system logging'], answer: 0 },
    { q: 'How should robust data pipelines handle missing or malformed log lines?', options: ['Gracefully ignore or log the faulty line without crashing the entire batch', 'Crash immediately', 'Delete the server', 'Restart the computer'], answer: 0 }
  ],

  // Level 9: Real-World Python
  'L9_1': [
    { q: 'Which standard library module is built specifically for command-line arguments?', options: ['argparse', 'cli_parser', 'terminal', 'cmdline'], answer: 0 },
    { q: 'What helpful feature does argparse generate automatically?', options: ['A standardized --help command with usage instructions', 'A website', 'A desktop icon', 'A sound effect'], answer: 0 }
  ],
  'L9_2': [
    { q: 'How do you read an environment variable in Python?', options: ['os.getenv("VARIABLE_NAME")', 'sys.env("VARIABLE_NAME")', 'env["VARIABLE_NAME"]', 'get_var("VARIABLE_NAME")'], answer: 0 },
    { q: 'Why are environment variables preferred for API keys and database passwords?', options: ['They keep secrets out of source code and version control repositories', 'They make the code run twice as fast', 'They encrypt the file system', 'They are required by Python'], answer: 0 }
  ],
  'L9_3': [
    { q: 'Which built-in module provides a unit testing framework in Python?', options: ['unittest', 'pytest_builtin', 'assert_framework', 'tester'], answer: 0 },
    { q: 'Which method asserts that two values are equal in a TestCase?', options: ['self.assertEqual(a, b)', 'self.assertMatch(a, b)', 'self.isSame(a, b)', 'self.check(a == b)'], answer: 0 }
  ],
  'L9_4': [
    { q: 'Why is the logging module preferred over print() statements in production?', options: ['It provides severity levels (INFO, WARNING, ERROR), timestamps, and file routing', 'print() is deprecated in Python', 'logging runs in C++', 'logging makes text bold'], answer: 0 },
    { q: 'Which log level is typically used for critical errors that require immediate attention?', options: ['ERROR or CRITICAL', 'DEBUG', 'INFO', 'TRACE'], answer: 0 }
  ],
  'L9_5': [
    { q: 'What does an HTTP status code of 200 mean from a web API?', options: ['OK (request succeeded)', 'Not Found', 'Internal Server Error', 'Redirect'], answer: 0 },
    { q: 'What data format is most commonly exchanged when calling REST APIs?', options: ['JSON', 'Plain binary', 'Word documents', 'Excel sheets'], answer: 0 }
  ],
  'L9_6': [
    { q: 'What is data cleaning in a data processing pipeline?', options: ['Filtering invalid rows, converting types, and handling missing values', 'Wiping the hard drive', 'Formatting Python indentation', 'Deleting variable names'], answer: 0 },
    { q: 'Which string method checks if a string consists entirely of digits?', options: ['.isdigit()', '.isnumber()', '.isint()', '.valid_number()'], answer: 0 }
  ],
  'L9_7': [
    { q: 'What file in a directory tells Python that the folder can be treated as a package?', options: ['__init__.py', 'main.py', 'package.json', 'setup.cfg'], answer: 0 },
    { q: 'What is the purpose of a README.md file in a project?', options: ['Explaining what the project does, how to set it up, and how to run it', 'Storing compiled bytecode', 'Configuring the operating system', 'Storing user passwords'], answer: 0 }
  ],
  'L9_8': [
    { q: 'Why is keeping state cleanly separated from presentation logic a best practice?', options: ['It makes data easy to save, test, and update without touching the UI', 'It reduces the number of files to 1', 'It compiles Python faster', 'It prevents all syntax errors'], answer: 0 },
    { q: 'How can you persist project data between application runs?', options: ['Saving to a file (like JSON, CSV, or SQLite)', 'Leaving the computer on forever', 'Writing comments', 'Printing output to the screen'], answer: 0 }
  ],

  // Level 10: Capstone & Engineering
  'L10_1': [
    { q: 'What is the first step in successful software project planning?', options: ['Defining requirements and understanding what problem you are solving', 'Writing code immediately', 'Deploying to the cloud', 'Buying server hosting'], answer: 0 },
    { q: 'Why is building a small prototype first helpful?', options: ['It validates your core idea and discovers unknowns early', 'It eliminates the need for testing', 'It is required by Git', 'It makes the project finish automatically'], answer: 0 }
  ],
  'L10_2': [
    { q: 'What is a core principle of clean code?', options: ['Clear, descriptive naming and functions that are easy to read and understand', 'Writing code in as few characters as possible', 'Avoiding comments entirely', 'Using single-letter variable names'], answer: 0 },
    { q: 'What does DRY stand for in software engineering?', options: ["Don't Repeat Yourself (avoid code duplication)", "Do Run Yearly", "Deploy Real Yield", "Data Routing Yield"], answer: 0 }
  ],
  'L10_3': [
    { q: 'What is separation of concerns in software architecture?', options: ['Dividing an application into distinct sections that each handle a specific responsibility', 'Separating computers from the network', 'Writing only one line per file', 'Deleting old functions'], answer: 0 },
    { q: 'In a 3-layer architecture, what does the business logic layer do?', options: ['Executes the core application rules and workflows', 'Draws pixels on the screen', 'Controls the operating system power', 'Routes network cables'], answer: 0 }
  ],
  'L10_4': [
    { q: 'What is an assert statement used for in Python?', options: ['Testing that a condition holds True, raising an AssertionError if it fails', 'Declaring a variable', 'Importing a module', 'Printing colored text'], answer: 0 },
    { q: 'Why is automated testing essential for maintaining software over time?', options: ['It catches regressions and bugs immediately when you make changes or add features', 'It replaces the need for a CPU', 'It makes Python files smaller', 'It writes code for you'], answer: 0 }
  ],
  'L10_5': [
    { q: 'Why must you always sanitize and validate user input?', options: ['To prevent crashes, injection attacks, and invalid state from corrupting data', 'To make typing faster', 'To change user passwords', 'To compress text files'], answer: 0 },
    { q: 'What should a secure function do when given invalid input?', options: ['Raise a clear exception or reject the input safely', 'Ignore it and continue silently', 'Crash the computer', 'Print the user’s password'], answer: 0 }
  ],
  'L10_6': [
    { q: 'What is Git used for in software development?', options: ['Tracking changes to source code and collaborating with teammates', 'Compiling Python to C', 'Formatting text files', 'Running tests automatically'], answer: 0 },
    { q: 'What does creating a Git branch allow you to do?', options: ['Work on a new feature or experiment safely without affecting the main codebase', 'Delete the repository', 'Turn off version control', 'Speed up download speeds'], answer: 0 }
  ],
  'L10_7': [
    { q: 'What is the purpose of externalizing configuration (like database URLs)?', options: ['Allowing the app to run in development, testing, and production without changing code', 'Hiding code from users', 'Making the file size smaller', 'Preventing all bugs permanently'], answer: 0 },
    { q: 'What should always be verified before deploying software to users?', options: ['All tests pass, documentation is up to date, and configurations are verified', 'The code is deleted', 'The database is wiped clean', 'All comments are removed'], answer: 0 }
  ],
  'L10_8': [
    { q: 'What makes a capstone project stand out in a programming portfolio?', options: ['Solving a real problem with clean architecture, tests, documentation, and user focus', 'Having over 100,000 lines of messy code', 'Using 50 different libraries for no reason', 'Having no README or instructions'], answer: 0 },
    { q: 'What is the most effective way to continue growing as a Python developer?', options: ['Build real projects, read documentation, write tests, and solve practical challenges', 'Memorize syntax without building anything', 'Stop practicing once you finish a tutorial', 'Copy code without understanding it'], answer: 0 }
  ]
};

console.log('Total quiz mappings created:', Object.keys(QUIZZES).length);
if (Object.keys(QUIZZES).length === 88) {
  console.log('✅ Exactly 88/88 lessons have tailored quizzes!');
} else {
  console.warn('⚠️ Missing quizzes count:', 88 - Object.keys(QUIZZES).length);
}
