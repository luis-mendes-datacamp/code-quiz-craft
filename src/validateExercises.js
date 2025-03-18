import OpenAI from "openai";
import fs from 'fs/promises';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const sanitize = (input) => {
    if (input.startsWith("```json")) {
        input = input.slice(7);
    } else if (input.startsWith("```")) {
       input = input.slice(3)
    }
    if (input.endsWith("```")) {
        return input.substring(0, input.length - 3);
    }
    return input;
}

async function validateExercise(exercise) {
    // Static validation
    const staticValidation = {
        valid: true,
        correctAnswerCount: 0,
        blankCount: 0,
        errors: []
    };

    // Count correct answers
    if (exercise.correctAnswer >= 0 && exercise.correctAnswer < exercise.options.length) {
        staticValidation.correctAnswerCount = 1;
    } else {
        staticValidation.valid = false;
        staticValidation.errors.push("Invalid correctAnswer index");
    }

    // Count blanks
    const blankMatches = (exercise.question.code.match(/___/g) || []);
    staticValidation.blankCount = blankMatches.length;
    if (staticValidation.blankCount !== 1) {
        staticValidation.valid = false;
        staticValidation.errors.push(`Found ${staticValidation.blankCount} blanks, expected exactly 1`);
    }

    // Dynamic validation using OpenAI
    const prompt = `
You are a strict Python code interpreter. Analyze this coding exercise with exact Python semantics:

Exercise: ${JSON.stringify(exercise, null, 2)}

Critical Validation Rules:
1. Python String Output Rules:
   - String outputs in Python print WITHOUT quotes: print("hello") outputs: hello
   - When printing string variables, NO quotes appear: x = "test"; print(x) outputs: test
   - Only str() and repr() add quotes: repr("test") outputs: 'test'

2. Python List Output Rules:
   - List outputs use square brackets and commas: [1, 2, 3]
   - Strings in lists DO have quotes: ["a", "b", "c"]
   - NO quotes in the output unless they're part of a list or explicit str/repr call

3. For each option:
   - Replace ___ with the option exactly as provided
   - String numbers ("1", "-1") are automatically converted to integers in Python
   - Run the code and capture EXACT console output
   - Compare character-by-character with: "${exercise.question.output}"
   - Remember: print("test") outputs test, NOT "test"

4. Correctness Rules:
   - Only ONE option should produce the exact expected output
   - That option's index must match correctAnswer: ${exercise.correctAnswer}
   - String comparison must be exact (spaces, quotes, etc.)
   - Consider Python's implicit string/number conversions

Respond in this exact JSON format:
{
    "valid": boolean,
    "correctOptionVerified": boolean,
    "outputMatches": boolean,
    "errors": string[],
    "optionAnalysis": {
        "workingOptions": number[],
        "failingOptions": number[],
        "outputs": string[]
    }
}
`;

    const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "You are a code validation assistant that responds only in valid JSON format."
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });

    const dynamicValidation = JSON.parse(sanitize(response.choices[0].message.content));

    // Additional validation based on option analysis
    if (dynamicValidation.optionAnalysis) {
        // Find all options that produce the expected output
        const workingOptions = [];
        dynamicValidation.optionAnalysis.outputs.forEach((output, idx) => {
            if (output === exercise.question.output) {
                workingOptions.push(exercise.options[idx]);
            }
        });

        // Check for uniqueness of solution
        if (workingOptions.length !== 1) {
            dynamicValidation.valid = false;
            dynamicValidation.errors.push(`Found ${workingOptions.length} working options (${workingOptions.join(', ')}), but exactly one correct answer is required`);
        }

        // Verify correct answer matches
        if (!dynamicValidation.optionAnalysis.workingOptions.includes(exercise.correctAnswer)) {
            dynamicValidation.valid = false;
            dynamicValidation.errors.push(`Correct answer index ${exercise.correctAnswer} does not produce the expected output`);
        }

        // Add detailed output analysis
        const outputDetails = dynamicValidation.optionAnalysis.outputs.map(
            (output, idx) => `\n  ${exercise.options[idx]}: ${output} ${output === exercise.question.output ? '(MATCH!)' : ''}`
        ).join('');

        dynamicValidation.errors.push(`Outputs for each option:${outputDetails}`);
    }

    return {
        id: exercise.id,
        staticValidation,
        dynamicValidation
    };
}

async function validateExercises(exercises) {
    const validationResults = await Promise.all(exercises.map(validateExercise));

    const validExercises = validationResults.filter(result =>
        result.staticValidation.valid && result.dynamicValidation.valid
    ).length;

    return {
        valid: validExercises === exercises.length,
        exercises: validationResults,
        summary: {
            totalExercises: exercises.length,
            validExercises,
            invalidExercises: exercises.length - validExercises
        }
    };
}

async function main() {
    try {
        let exercises;
        const args = process.argv.slice(2);

        if (args.length > 0) {
            // Read from file
            const filePath = args[0];
            const fileContent = await fs.readFile(filePath, 'utf8');
            exercises = JSON.parse(fileContent);
        } else {
            // Read from stdin
            const chunks = [];
            for await (const chunk of process.stdin) {
                chunks.push(chunk);
            }
            const input = chunks.join('');
            exercises = JSON.parse(input);
        }

        const validationResult = await validateExercises(exercises);
        console.log(JSON.stringify(validationResult, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Execute the main function
main();
