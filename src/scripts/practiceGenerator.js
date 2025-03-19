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
    return {exerciseCount, courseId, lesson};
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
    const prompt = 'Context: You are a teacher, and you are creating exercises based on the lesson details provided as the input. Input is in JSON format.' +
        `Generate a JSON array of size ${exerciseCount} containing coding exercises in the "fill in the blanks" style based on the content of the course.
        'There should be exactly one blank to fill. The blank to be filled should be shown as three underscores: \`___\`.' +
        'Each exercise should have between 3 and 5 options.' +
        'Exactly one option should be correct.' +
        'Here's an example of one exercise:\n` +
        '```' + JSON.stringify(exerciseExample) + '```\n' +
        '`question.code` field contains the code with the blank and `question.output` the output of the code if it were run.' +
        'The difficulty of the exercises should be: beginner (40%), intermediate (30%), advanced (20%), expert (10%)' +
        'Ensure the output you generate is a valid JSON without additional markup.';


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
    const {exerciseCount, courseId, lesson} = getArguments();

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
