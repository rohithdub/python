const { executePythonCode } = require('../server/executor.js');

async function main() {
  const r1 = await executePythonCode('print("Hello from executor! 5 * 5 =", 5 * 5)');
  console.log('Result 1 (simple):', r1);

  const r2 = await executePythonCode('val = input("Number: ")\nprint("You entered:", val)', '42');
  console.log('Result 2 (with input):', r2);
}

main();
