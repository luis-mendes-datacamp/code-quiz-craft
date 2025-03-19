package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
"api/handlers"
"api/models"
)

func loadQuestions() ([]models.Question, error) {
    file, err := os.ReadFile("../data/examples/python/questions.json")
    if err != nil {
        return nil, err
    }

    var questionSet models.QuestionSet
    if err := json.Unmarshal(file, &questionSet); err != nil {
        return nil, err
    }

    // Set courseId for each question from the parent QuestionSet
    for i := range questionSet.Questions {
        questionSet.Questions[i].CourseID = questionSet.CourseID
    }

    return questionSet.Questions, nil
}

func main() {
	questions, err := loadQuestions()
	if err != nil {
		log.Fatal("Failed to load questions:", err)
	}

	questionsHandler := handlers.NewQuestionsHandler(questions)

	http.HandleFunc("/api/questions", questionsHandler.GetQuestions)

log.Println("Server starting on :3500")
if err := http.ListenAndServe(":3500", nil); err != nil {
		log.Fatal(err)
	}
}
