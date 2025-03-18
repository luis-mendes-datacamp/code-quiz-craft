import q from './questions.json';

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
  difficultyLevel: string;
}

export const questions: Question[] = q;

// Filter questions by difficulty
export const filterQuestionsByDifficulty = (difficulty: Question["difficultyLevel"]) => {
  return questions.filter(question => question.difficultyLevel === difficulty);
};

// Get random questions
export const getRandomQuestions = (count: number = 5) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
