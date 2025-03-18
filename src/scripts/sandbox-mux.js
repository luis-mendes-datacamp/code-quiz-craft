import mux from "@datacamp/multiplexer-client";
import path from "path";
import { promises as fs } from "fs";

const DEFAULT_MUX_TIMEOUT_MS = 30000;

class CodeExecutor {
  initCommand = {
    code: "",
    command: "init",
    pec: "",
  };

  settings = {
    force_new: true,
    initCommand: this.initCommand,
    language: "python",
    maxRestart: 0,
    maxRetry: 0,
    multiplexerUrl: this.multiplexerUrl,
    startOptions: {
      force_new: true,
      runtime_config: "default",
    },
  };

  constructor(
    userInfo,
    multiplexerUrl,
    multiplexerSettings,
    timeout = DEFAULT_MUX_TIMEOUT_MS
  ) {
    const muxSettings = { ...this.settings, ...multiplexerSettings };
    this.session = new mux.SyncSession(userInfo, muxSettings);
    this.muxKeepAliveTimeout = undefined;
    this.timeout = timeout;
    this.multiplexerUrl = multiplexerUrl;
  }

  keepAlive = async () => {
    return this.execute("").then(() => {
      // make sure we are a void promise to not leak implementation details
    });
  };

  executeSubmission = async (code, isPreChallengeCode) => {
    const command = { code, command: "console" };

    // reset the session, before running the pre-challenge code,
    // to make sure that we flush any environment mutation from previous executions
    if (isPreChallengeCode) {
      await this.reset();
    }

    return this.session.input(command);
  };

  // set the maximum execution timeout, this function can only reject
  executionTimeout = () => {
    return new Promise((_, reject) => {
      this.muxKeepAliveTimeout = setTimeout(async () => {
        return reject(new Error("Code executor timed out"));
      }, this.timeout);
    });
  };

  cleanupTimeout = () => {
    if (this.muxKeepAliveTimeout) {
      clearTimeout(this.muxKeepAliveTimeout);
    }
  };

  getSessionStatus = () => {
    if (!this.session) {
      return undefined;
    }
    return this.session.options.status;
  };

  // start the mux session
  start = async (retries = 40) => {
    try {
      const currentStatus = this.getSessionStatus();
      console.log('!@# currentStatus', currentStatus);
      if (currentStatus === "busy" || currentStatus === "ready") {
        throw new Error("multiplexer session is already started");
      }
      console.log('!@# starting session');
      await this.session.start();
    } catch (e) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      if (retries > 0) {
        await this.session.stop().catch(() => {
          // at least we tried. The session will be killed by the mux after 30s now
          return null;
        });
        await this.start(retries - 1);
      } else {
        throw e;
      }
    }
  };

  execute = (code, isPreChallengeCode = false) => {
    if (this.session == null) {
      throw new Error("no session found. start the multiplexer session");
    }
    // resolve, if the code executes within the timeout, otherwise reject
    return Promise.race([
      this.executeSubmission(code, isPreChallengeCode),
      this.executionTimeout(),
    ]).finally(this.cleanupTimeout);
  };

  reset = async () => {
    const currentStatus = this.getSessionStatus();

    if (this.session != null && currentStatus !== "none") {
      await this.session.reset();
    }
  };

  stop = async () => {
    const currentStatus = this.getSessionStatus();

    if (this.session != null && currentStatus !== "none") {
      await this.session.stop();
      this.cleanupTimeout();
    }
  };

  restart = async () => {
    // cleanup the old session
    await this.stop();
    // start a new session
    await this.start();
  };
}

const executeCode = async (userCode) => {
  const muxAuthenticationInfo = {
    email: "damian.knapik@datacamp.com",
    authentication_token:
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJneUZvOVJGU21lTUIzcGZRNk1oMkhFa186dksySDYxR05tbF9aSENZZzdnIn0.eyJleHAiOjE3NDk3NDM5MDYsImlhdCI6MTc0MTk2NzkwNiwiYXV0aF90aW1lIjoxNzQxOTY3OTA2LCJqdGkiOiI5YmE0ZTYzZS04MDQ4LTQzNjUtYmEwNS03YmVhM2U2MWJkYmYiLCJpc3MiOiJodHRwczovL2F1dGguZGF0YWNhbXAuY29tL3JlYWxtcy9kYXRhY2FtcC11c2VycyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJkNzk3NmVlMy1lMzRhLTRkMTktODQyZS1hYWZkZWZjM2E4NGMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJEQjJEMkI1Ri1ERUM4LTQyMjUtQkNBQS0xRDM0NTA0RDg2OTYiLCJzaWQiOiJkZGYyNWEyZC1hMDJkLTRlNmYtYmQ5OS1hYmRmNmUxYWY5MWIiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWRhdGFjYW1wLXVzZXJzIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgZGMtdXNlci1pZCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImIyYl9zc29fdHJhY2VfaWQiOiI3MDExOWMzYy00NDgxLTQzNmUtOTUxYy0wMDQ2MmUwNzZiODUiLCJ1c2VyX2lkIjo4MjQzMzgwLCJuYW1lIjoiRGFtaWFuIEtuYXBpayIsInByZWZlcnJlZF91c2VybmFtZSI6ImRhbWlhbi5rbmFwaWtAZGF0YWNhbXAuY29tIiwiaWRlbnRpdHlfcHJvdmlkZXJfYWxpYXMiOiJiMmItc3NvLWdyb3VwLTQ5NDciLCJnaXZlbl9uYW1lIjoiRGFtaWFuIiwiZmFtaWx5X25hbWUiOiJLbmFwaWsiLCJlbWFpbCI6ImRhbWlhbi5rbmFwaWtAZGF0YWNhbXAuY29tIn0.FYBm8iP4iBOXtQBzyxhF-7_D6YFqTgb1cSuMK4fVoOCqS8Oj9YnZ1UZ4cwemuzkfVug1lWesrfQKVB9nrSzCwz7BUy73tsWugXzLzOoV33_NLv5lK1ukin2fPppN50TB2QPSk3aZphsPtg07_ZQAJDvzdrHKgjs4LAIlwitqxQGMFmvLVT44J-p7COxoLrX7CxtqhZ0uyos3SMofBDYdCEEQEfiTdef7Q-_Y-haCCfywE7m_njePI3zWpxg4XMOIsOqegrX9Z-blqFo0RuLh66jv7uWmETS_PvMXN98KlkENjrgPHYwWQ2EuoObCu8E7_BrcBSDr-z3GVBuMdMpzWw",
  };

  // Create Mux Session
  const codeExecutor = new CodeExecutor(
    muxAuthenticationInfo,
    "https://sessions.datacamp.com",
    {
      force_new: false,
      maxRestart: 2,
      maxRetry: 0,
      // WARNING! Multiplexer setings are not deep-merged in CodeExecutor,
      // so force_new, runtime_config, and image should always be set when overriding startOptions.
      startOptions: {
        force_new: false,
        image:
          "course-735-master:7fc8cecbe5d86f3288f8ba26e2fd0820-20250226160623729",
        runtime_config: undefined,
      },
    }
  );

  await codeExecutor.start();

  return codeExecutor.execute(userCode, false);
};

function fixPythonCode(code) {
  // Add commas between list items
  return code.replace(/\[([^\]]+)\]/g, (match, contents) => {
    return (
      "[" +
      contents.replace(/(\d+|\".+?\"|\'.+?\')\s+(?=\d+|\"|\')/g, "$1, ") +
      "]"
    );
  });
}

async function testExercise(exercise) {
  console.log(`\nTesting exercise ${exercise.id}:`);
  console.log("Original code:", exercise.question.code);
  console.log("Expected output:", exercise.question.output);

  for (const option of exercise.options) {
    const originalCode = exercise.question.code.replace("___", option);
    const code = fixPythonCode(originalCode);
    console.log(`\nTrying option: ${option}`);
    console.log("Modified code:", code);

    const output = await executeCode(code);
    if (output !== null) {
      const matches = output === exercise.question.output;
      console.log("Got output:", output);
      console.log("Output matches?", matches ? "✅ YES" : "❌ NO");
      if (matches) {
        console.log("✨ Found correct answer:", option);
      }
    }
  }
}

async function main() {
  try {
    // Read questions
    const questionsPath = path.join(process.cwd(), "src/data/questions.json");
    console.log("Reading questions from:", questionsPath);
    const questions = JSON.parse(await fs.readFile(questionsPath, "utf-8"));
    console.log(`Loaded ${questions.length} questions`);

    // Test each exercise
    for (const exercise of questions) {
      await testExercise(exercise);
      console.log("-".repeat(80));
    }
  } catch (err) {
    console.error("Failed to run tests:", err);
  }
}

main().catch(console.error);
