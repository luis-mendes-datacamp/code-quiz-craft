import mux from '@datacamp/multiplexer-client';
import fs from 'fs/promises';
import path from 'path';

const config = {
  multiplexerUrl: 'https://sessions.datacamp.com',
  credentials: {
    email: 'damian.knapik@datacamp.com',
    authentication_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJneUZvOVJGU21lTUIzcGZRNk1oMkhFa186dksySDYxR05tbF9aSENZZzdnIn0.eyJleHAiOjE3NDk3NDM5MDYsImlhdCI6MTc0MTk2NzkwNiwiYXV0aF90aW1lIjoxNzQxOTY3OTA2LCJqdGkiOiI5YmE0ZTYzZS04MDQ4LTQzNjUtYmEwNS03YmVhM2U2MWJkYmYiLCJpc3MiOiJodHRwczovL2F1dGguZGF0YWNhbXAuY29tL3JlYWxtcy9kYXRhY2FtcC11c2VycyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJkNzk3NmVlMy1lMzRhLTRkMTktODQyZS1hYWZkZWZjM2E4NGMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJEQjJEMkI1Ri1ERUM4LTQyMjUtQkNBQS0xRDM0NTA0RDg2OTYiLCJzaWQiOiJkZGYyNWEyZC1hMDJkLTRlNmYtYmQ5OS1hYmRmNmUxYWY5MWIiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWRhdGFjYW1wLXVzZXJzIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgZGMtdXNlci1pZCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImIyYl9zc29fdHJhY2VfaWQiOiI3MDExOWMzYy00NDgxLTQzNmUtOTUxYy0wMDQ2MmUwNzZiODUiLCJ1c2VyX2lkIjo4MjQzMzgwLCJuYW1lIjoiRGFtaWFuIEtuYXBpayIsInByZWZlcnJlZF91c2VybmFtZSI6ImRhbWlhbi5rbmFwaWtAZGF0YWNhbXAuY29tIiwiaWRlbnRpdHlfcHJvdmlkZXJfYWxpYXMiOiJiMmItc3NvLWdyb3VwLTQ5NDciLCJnaXZlbl9uYW1lIjoiRGFtaWFuIiwiZmFtaWx5X25hbWUiOiJLbmFwaWsiLCJlbWFpbCI6ImRhbWlhbi5rbmFwaWtAZGF0YWNhbXAuY29tIn0.FYBm8iP4iBOXtQBzyxhF-7_D6YFqTgb1cSuMK4fVoOCqS8Oj9YnZ1UZ4cwemuzkfVug1lWesrfQKVB9nrSzCwz7BUy73tsWugXzLzOoV33_NLv5lK1ukin2fPppN50TB2QPSk3aZphsPtg07_ZQAJDvzdrHKgjs4LAIlwitqxQGMFmvLVT44J-p7COxoLrX7CxtqhZ0uyos3SMofBDYdCEEQEfiTdef7Q-_Y-haCCfywE7m_njePI3zWpxg4XMOIsOqegrX9Z-blqFo0RuLh66jv7uWmETS_PvMXN98KlkENjrgPHYwWQ2EuoObCu8E7_BrcBSDr-z3GVBuMdMpzWw'
  },
  startOptions: {
    image_tag: 'course-735-master:7fc8cecbe5d86f3288f8ba26e2fd0820-20250226160623729',
    course_id: '735'
  }
};

const session = new mux.SyncSession(
  config.credentials,
  {
    multiplexerUrl: config.multiplexerUrl,
    language: 'python',
    debug: true,
    startOptions: config.startOptions
  }
);

await session.start();

async function executeCode(code) {
  try {
    const response = await session.input({
      command: 'console',
      code
    });

    // Parse the response - it comes as an array of output objects
    let result = '';
    for (const output of response) {
      if (output.type === 'output') {
        result = output.payload;
      } else if (output.type === 'backend-error') {
        throw new Error(output.payload);
      }
    }
    return result.trim();
  } catch (err) {
    console.error('Error executing code:', err.message);
    return null;
  }
}

function fixPythonCode(code) {
  // Add commas between list items
  return code.replace(/\[([^\]]+)\]/g, (match, contents) => {
    return '[' + contents.replace(/(\d+|\".+?\"|\'.+?\')\s+(?=\d+|\"|\')/g, '$1, ') + ']';
  });
}

async function testExercise(exercise) {
  console.log(`\nTesting exercise ${exercise.id}:`);
  console.log('Original code:', exercise.question.code);
  console.log('Expected output:', exercise.question.output);

  for (const option of exercise.options) {
    const originalCode = exercise.question.code.replace('___', option);
    const code = fixPythonCode(originalCode);
    console.log(`\nTrying option: ${option}`);
    console.log('Modified code:', code);

    const output = await executeCode(code);
    if (output !== null) {
      const matches = output === exercise.question.output;
      console.log('Got output:', output);
      console.log('Output matches?', matches ? '✅ YES' : '❌ NO');
      if (matches) {
        console.log('✨ Found correct answer:', option);
      }
    }
  }
}

async function main() {
  try {
    // Initialize session
    console.log('Starting multiplexer session...');
    await session.start();
    console.log('Session started successfully');

    // Read questions
    const questionsPath = path.join(process.cwd(), 'src/data/questions.json');
    console.log('Reading questions from:', questionsPath);
    const questions = JSON.parse(await fs.readFile(questionsPath, 'utf-8'));
    console.log(`Loaded ${questions.length} questions`);

    // Test each exercise
    for (const exercise of questions) {
      await testExercise(exercise);
      console.log('-'.repeat(80));
    }
  } catch (err) {
    console.error('Failed to run tests:', err);
  } finally {
    console.log('Cleaning up session...');
    await session.stop();
    console.log('Session stopped');
  }
}

main().catch(console.error);
