package models

type Question struct {
ID              string   `json:"id"`
Type            string   `json:"type"`
Question        QuestionDetail `json:"question"`
Options         []string `json:"options"`
CorrectAnswer   int      `json:"correctAnswer"`
DifficultyLevel string   `json:"difficultyLevel"`
CourseID        string   `json:"courseId,omitempty"`
LessonID        string   `json:"lessonId,omitempty"`
}

type QuestionDetail struct {
	Code        string `json:"code"`
	Output      string `json:"output"`
	Explanation string `json:"explanation"`
}
