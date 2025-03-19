package models

type QuestionSet struct {
    CourseID            string     `json:"courseId"`
    ProgrammingLanguage string     `json:"programmingLanguage"`
    Questions           []Question `json:"questions"`
}

type Question struct {
    ID              string         `json:"id"`
    CourseID        string         `json:"courseId"`
    LessonID        string         `json:"lessonId"`
    Type            string         `json:"type"`
    Question        QuestionDetail `json:"question"`
    Options         []string       `json:"options"`
    CorrectAnswer   int           `json:"correctAnswer"`
    DifficultyLevel string        `json:"difficultyLevel"`
}

type QuestionDetail struct {
	Code        string `json:"code"`
	Output      string `json:"output"`
	Explanation string `json:"explanation"`
}
