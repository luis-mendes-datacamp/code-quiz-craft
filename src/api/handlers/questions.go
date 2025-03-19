package handlers

import (
	"encoding/json"
	"net/http"
	"api/models"
)

type QuestionsHandler struct {
	questions []models.Question
}

func NewQuestionsHandler(questions []models.Question) *QuestionsHandler {
	return &QuestionsHandler{questions: questions}
}

func (h *QuestionsHandler) GetQuestions(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    courseId := r.URL.Query().Get("courseId")
    lessonId := r.URL.Query().Get("lessonId")

    if courseId == "" && lessonId == "" {
        json.NewEncoder(w).Encode(h.questions)
        return
    }

    filteredQuestions := make([]models.Question, 0)
    for _, q := range h.questions {
        if (courseId == "" || q.CourseID == courseId) &&
           (lessonId == "" || q.LessonID == lessonId) {
            filteredQuestions = append(filteredQuestions, q)
        }
    }

    json.NewEncoder(w).Encode(filteredQuestions)
}
