# Questions API Documentation

## Base URL
```
http://localhost:3500
```

## Endpoints

### Get Questions
```
GET /api/questions
```

Retrieves a list of questions, optionally filtered by courseId and lessonId.

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| courseId  | string | No       | Filter questions by course ID  |
| lessonId  | string | No       | Filter questions by lesson ID  |

#### Response Format

```typescript
interface QuestionDetail {
  code: string;
  output: string;
  explanation: string;
}

interface Question {
  id: string;
  type: string;
  question: QuestionDetail;
  options: string[];
  correctAnswer: number;
  difficultyLevel: string;
  courseId?: string;
  lessonId?: string;
}

// Response: Question[]
```

#### Example Usage

```typescript
// Fetch all questions
const getAllQuestions = async () => {
  const response = await fetch('http://localhost:3500/api/questions');
  const questions: Question[] = await response.json();
  return questions;
};

// Fetch questions for a specific course
const getCourseQuestions = async (courseId: string) => {
  const response = await fetch(`http://localhost:3500/api/questions?courseId=${courseId}`);
  const questions: Question[] = await response.json();
  return questions;
};

// Fetch questions for a specific lesson in a course
const getLessonQuestions = async (courseId: string, lessonId: string) => {
  const response = await fetch(`http://localhost:3500/api/questions?courseId=${courseId}&lessonId=${lessonId}`);
  const questions: Question[] = await response.json();
  return questions;
};
```

#### Example Response

```json
[
  {
    "id": "b1e72bd6-5778-4a31-ad51-502bd367ec84",
    "type": "Blanks",
    "question": {
      "code": "my_list = [1, 2, 3]\nmy_list.append(___)\nprint(my_list)",
      "output": "[1, 2, 3, 4]",
      "explanation": "The append() method adds an element at the end of the list."
    },
    "options": ["4", "5", "6", "7"],
    "correctAnswer": 0,
    "difficultyLevel": "beginner",
    "courseId": "python-101",
    "lessonId": "lists-basics"
  }
]
```

## Error Handling

The API returns JSON responses with appropriate HTTP status codes:

- `200 OK`: Successful request with questions array (may be empty if no matches)
- `500 Internal Server Error`: Server-side error (check error message in response)
