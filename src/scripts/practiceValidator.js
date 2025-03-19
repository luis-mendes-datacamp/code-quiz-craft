import mux from "@datacamp/multiplexer-client";
import path from "path";
import {promises as fs} from "fs";

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
        const muxSettings = {...this.settings, ...multiplexerSettings};
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
        const command = {code, command: "console"};

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

const executeCode = async (imageTag, programmingLanguage, userCode) => {
    const syncSession = new mux.SyncSession(
        {email: process.env.DATACAMP_EMAIL, authentication_token: process.env.DATACAMP_TOKEN},
        {
            multiplexerUrl: 'https://sessions.datacamp.com', language: programmingLanguage, initCommand: {
                code: '',
                command: 'init',
                pec: '',
            }
        }
    );

    await syncSession.start();
    const [response] = await syncSession.input({command: 'console', code: userCode}, {image_tag: imageTag});
    return response.payload;
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

async function testExercise(imageTag, programmingLanguage, exercise) {
    console.log(`\nTesting exercise ${exercise.id}:`);
    console.log("Original code:", exercise.question.code);
    console.log("Expected output:", exercise.question.output);

    let correctAnswerCount = 0;
    for (const option of exercise.options) {
        const originalCode = exercise.question.code.replace("___", option);
        const code = fixPythonCode(originalCode);
        console.log(`\nTrying option: ${option}`);
        console.log("Modified code:", code);

        const output = await executeCode(imageTag, programmingLanguage, code);
        if (output !== null) {
            const matches = output === exercise.question.output;
            console.log("Got output:", output);
            console.log("Output matches?", matches ? "✅ YES" : "❌ NO");
            if (matches) {
                console.log("✨ Found correct answer:", option);
                correctAnswerCount++;
            }
        }
    }
    return correctAnswerCount;
}
const getImageTag = async (courseId) => {
    const response = await fetch(`https://imb.datacamp.com/active_course_images/${courseId}`);
    const body = await response.json();
    return body.imageTag;
}

async function main() {
    try {
        // Read questions
        const questionsPath = path.join(process.cwd(), "src/data/questions.json");
        console.log("Reading questions from:", questionsPath);
        const { courseId, questions, programmingLanguage } = JSON.parse(await fs.readFile(questionsPath, "utf-8"));
        const imageTag = await getImageTag(courseId);

        console.log(`Loaded ${questions.length} questions`);


        const results = [];
        const validQuestions = [];
        // Test each exercise
        for (const [index, exercise] of questions.entries()) {
            const correctAnswerCount = await testExercise(imageTag, programmingLanguage, exercise);
            console.log("-".repeat(80));
            results.push([index, correctAnswerCount]);
            if (correctAnswerCount === 1) {
                validQuestions.push(exercise);
            }
        }
        console.log(`Summary:\n`);
        results.forEach((result) => {
            console.log(result)
        });
        const validQuestionPath = path.join(process.cwd(), "src/data/validQuestions.json");

        await fs.writeFile(validQuestionPath, JSON.stringify({
            courseId,
            programmingLanguage,
            questions: validQuestions
        }));
    } catch (err) {
        console.error("Failed to run tests:", err);
    }
}

main().catch(console.error);
