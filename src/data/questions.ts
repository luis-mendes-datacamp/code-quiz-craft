
export interface Question {
  id: string;
  type: string;
  question: {
    code: string;
    output: string;
    explanation: string;
  };
  options: string[];
  correctAnswer: number;
  difficultyLevel: "beginner" | "intermediate" | "expert";
}

export const questions: Question[] = [
  {
    "id": "1a2b3c4d-5678-9101-1121-314151617181",
    "type": "Blanks",
    "question": {
      "code": "print(type(42)) # Output: <class '___'>",
      "output": "<class 'int'>",
      "explanation": "The type() function returns the type of a given value. The number 42 is an integer."
    },
    "options": ["int", "float", "str", "bool", "complex"],
    "correctAnswer": 0,
    "difficultyLevel": "beginner"
  },
  {
    "id": "2a3b4c5d-6789-0123-4567-891011121314",
    "type": "Blanks",
    "question": {
      "code": "x = 'Python'\\nprint(x[___])",
      "output": "'P'",
      "explanation": "Strings in Python are indexed starting at 0. x[0] returns 'P'."
    },
    "options": ["1", "-1", "0", "6", "None"],
    "correctAnswer": 2,
    "difficultyLevel": "beginner"
  },
  {
    "id": "3a4b5c6d-7890-1234-5678-901112131415",
    "type": "Blanks",
    "question": {
      "code": "print(10 // 3) # Output: ___",
      "output": "3",
      "explanation": "The '//' operator performs floor division, rounding down the result."
    },
    "options": ["3.33", "3", "4", "None", "10"],
    "correctAnswer": 1,
    "difficultyLevel": "beginner"
  },
  {
    "id": "4a5b6c7d-8901-2345-6789-011121314151",
    "type": "Blanks",
    "question": {
      "code": "numbers = [10, 20, 30, 40]\\nprint(___(numbers))",
      "output": "4",
      "explanation": "len() is the built-in function used to get the number of elements in a list."
    },
    "options": ["size", "count", "length", "len", "num"],
    "correctAnswer": 3,
    "difficultyLevel": "beginner"
  },
  {
    "id": "5a6b7c8d-9012-3456-7890-112131415161",
    "type": "Blanks",
    "question": {
      "code": "print(2 ** 3) # Output: ___",
      "output": "8",
      "explanation": "The '**' operator in Python is used for exponentiation. 2 ** 3 = 8."
    },
    "options": ["6", "8", "9", "None", "16"],
    "correctAnswer": 1,
    "difficultyLevel": "beginner"
  },
  {
    "id": "6a7b8c9d-0123-4567-8901-121314151617",
    "type": "Blanks",
    "question": {
      "code": "x = 'hello'\\nprint(x.upper()) # Output: '___'",
      "output": "HELLO",
      "explanation": "The .upper() method converts a string to uppercase."
    },
    "options": ["hello", "HELLO", "Hello", "hELLO", "None"],
    "correctAnswer": 1,
    "difficultyLevel": "beginner"
  },
  {
    "id": "7a8b9c0d-1234-5678-9012-131415161718",
    "type": "Blanks",
    "question": {
      "code": "for i in range(3):\\n    print(i) # Last output: ___",
      "output": "2",
      "explanation": "range(3) generates values 0, 1, and 2. The last printed value is 2."
    },
    "options": ["0", "1", "2", "3", "None"],
    "correctAnswer": 2,
    "difficultyLevel": "beginner"
  },
  {
    "id": "8a9b0c1d-2345-6789-0123-141516171819",
    "type": "Blanks",
    "question": {
      "code": "if 'x' in 'exam':\\n    print('Found!') # Output: ___",
      "output": "Found!",
      "explanation": "The 'in' keyword checks for substring presence. 'x' exists in 'exam'."
    },
    "options": ["Found!", "Error", "None", "False", "True"],
    "correctAnswer": 0,
    "difficultyLevel": "beginner"
  },
  {
    "id": "9a0b1c2d-3456-7890-1234-151617181920",
    "type": "Blanks",
    "question": {
      "code": "nums = [1, 2, 3, 4]\\nprint(nums[-1]) # Output: ___",
      "output": "4",
      "explanation": "Negative indexing in Python allows access from the end. nums[-1] is 4."
    },
    "options": ["1", "2", "3", "4", "None"],
    "correctAnswer": 3,
    "difficultyLevel": "intermediate"
  },
  {
    "id": "10a1b2c3d-4567-8901-2345-161718192021",
    "type": "Blanks",
    "question": {
      "code": "result = 5 + 2 * 3 ** 2\\nprint(result) # Output: ___",
      "output": "23",
      "explanation": "Exponentiation (**), then multiplication, then addition: 3 ** 2 = 9, 2 * 9 = 18, 5 + 18 = 23."
    },
    "options": ["17", "23", "25", "30", "None"],
    "correctAnswer": 1,
    "difficultyLevel": "intermediate"
  },
  {
    "id": "19a0b1c2d-2345-6789-0123-192021222324",
    "type": "Blanks",
    "question": {
      "code": "numbers = [1, 2, 3, 4, 5]\\nprint(sum(numbers[1:___]))",
      "output": "9",
      "explanation": "The slice numbers[1:4] includes elements at index 1, 2, and 3 (2, 3, 4). Their sum is 9."
    },
    "options": ["3", "4", "5", "-1", "None"],
    "correctAnswer": 1,
    "difficultyLevel": "expert"
  },
  {
    "id": "20a1b2c3d-2345-6789-0123-252627282930",
    "type": "Blanks",
    "question": {
      "code": "def func(x):\\n    return x * x\\nprint(func(3)) # Output: ___",
      "output": "9",
      "explanation": "The function squares the input. 3 * 3 = 9."
    },
    "options": ["3", "6", "9", "12", "None"],
    "correctAnswer": 2,
    "difficultyLevel": "expert"
  }
];

// Filter questions by difficulty
export const filterQuestionsByDifficulty = (difficulty: Question["difficultyLevel"]) => {
  return questions.filter(question => question.difficultyLevel === difficulty);
};

// Get random questions
export const getRandomQuestions = (count: number = 5) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
