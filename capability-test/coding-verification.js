function factorial(n) {
  if (n < 0) throw new Error('Negative input not supported');
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

function runTests() {
  const tests = [
    { input: 0, expected: 1 },
    { input: 1, expected: 1 },
    { input: 5, expected: 120 },
    { input: 7, expected: 5040 }
  ];

  let passed = 0;
  for (const t of tests) {
    const actual = factorial(t.input);
    if (actual === t.expected) {
      passed++;
      console.log(`PASS: factorial(${t.input}) = ${actual}`);
    } else {
      console.log(`FAIL: factorial(${t.input}) expected ${t.expected}, got ${actual}`);
    }
  }

  try {
    factorial(-1);
    console.log('FAIL: negative input should throw');
  } catch (e) {
    passed++;
    console.log('PASS: negative input throws error');
  }

  console.log(`\nResults: ${passed}/${tests.length + 1} tests passed`);
  return passed === tests.length + 1;
}

process.exit(runTests() ? 0 : 1);
