import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Import the required module
// Function to read command line arguments
function getArguments() {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.error('Please provide exactly two arguments: number_of_exercises, courseId, lesson');
        process.exit(1);
    }
    const [exerciseCount, courseId, lesson] = args;
    return { exerciseCount, courseId, lesson };
}
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

async function generatePractice(exerciseCount, lessonExercises) {

    const exerciseExample = {
        "id": "e36fd17a-6564-4a5a-879d-2933f6d69327",
        "type": "Blanks",
        "question": {
            "code": "numbers = [10, 20, 30, 40]\nprint(___(numbers))Code",
            "output": "4",
            "explanation": "len() is the built-in function used to get the number of elements in a list."
        },
        "options": ["size", "count", "length", "len", "num"],
        "correctAnswer": 3,
        "difficultyLevel": "beginner"
    }
    const prompt = 'Context: You are a Python teacher creating exercises. Follow these strict rules:' +
        '\n\nOutput Format Rules:' +
        '\n1. String Values:' +
        '\n   - For printing strings: print("hello") outputs hello (no quotes)' +
        '\n   - For lists with strings: ["a", "b"] prints with quotes: [\'a\', \'b\']' +
        '\n2. Number Outputs:' +
        '\n   - Integer division (/) always shows decimal: 6/3 outputs 2.0' +
        '\n   - Floor division (//) shows integer: 6//3 outputs 2' +
        '\n3. Multiple Line Outputs:' +
        '\n   - Each print() starts on a new line' +
        '\n   - Exact newline count matters' +
        '\n   - No trailing newline at the end' +
        '\n4. Boolean Outputs:' +
        '\n   - print(True) outputs True (capital T)' +
        '\n   - print(False) outputs False (capital F)' +

        '\n\nExercise Requirements:' +
        `\n1. Generate ${exerciseCount} "fill in the blanks" exercises.` +
        '\n2. Exactly ONE blank to fill (marked as ___).' +
        '\n3. Between 3-5 options per exercise.' +
        '\n4. Exactly ONE correct option - validate by running the code.' +
        '\n5. The "correctAnswer" property is the index (0-based) of the correct option.' +
        '\n6. Output field must show EXACT console output, character by character.' +

        '\n\nHere is an example:\n' +
        '```' + JSON.stringify(exerciseExample, null, 2) + '```\n' +

        '\nDifficulty Distribution:' +
        '\n- beginner: 40%' +
        '\n- intermediate: 30%' +
        '\n- advanced: 20%' +
        '\n- expert: 10%' +

        '\n\nValidation Steps:' +
        '\n1. For each exercise:' +
        '\n   - Replace ___ with each option' +
        '\n   - Run the code' +
        '\n   - Verify EXACT output match' +
        '\n   - Confirm only one option works' +
        '\n2. Verify correctAnswer index matches the working option' +
        '\n3. Test that no other option produces the same output' +

        '\nEnsure your response is valid JSON without markup.';

    const response = await client.chat.completions.create({
        model: "gpt-4o",
            messages: [
                {
                    "role": "developer",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": JSON.stringify(lessonExercises),
                        }
                    ]
                }
            ],

    });


    return JSON.parse(sanitize(response.choices[0].message.content));
}

// Main function
async function main() {
    const { exerciseCount, courseId, lesson } = getArguments();

    const response = await fetch(`https://campus-api.datacamp.com/api/courses/${courseId}`);
    const courseData = await response.json();
    const chapterResponses = await Promise.all(courseData.chapters.map(chapter => fetch(`https://campus-api.datacamp.com/api/courses/${courseId}/chapters/${chapter.id}/exercises`)));
    const lessonsResponse = await fetch(`https://campus-api.datacamp.com/api/courses/${courseId}/lessons`);
    const lessons = await lessonsResponse.json();
    const chapterData = await Promise.all(chapterResponses.map(response => response.json()));
    const enrichedChapterData = await Promise.all(chapterData.map(async (chapter) => {
        return Promise.all(chapter.map(async (exercise) => {
            if (exercise.type === 'VideoExercise') {
                const response = await fetch(`https://projector.datacamp.com/api/videos/${exercise.projector_key}/transcript`);
                const transcript = await response.json();
                return {...exercise, video_exercise_transcript: transcript};
            }
            return exercise;
        }));
    }));

    const currentLesson = lessons.find((l) => l.number === Number(lesson));
    const exerciseMap = Object.fromEntries(enrichedChapterData.flatMap(chapter => chapter.map(exercise => [exercise.id, exercise])));
    const lessonExercises = currentLesson.exercises.map(exercise => exerciseMap[exercise.id]);
    const output = await generatePractice(exerciseCount, lessonExercises);
    console.log(JSON.stringify(output));
}

// Execute the main function
main();
