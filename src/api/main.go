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
	file, err := os.ReadFile("../data/validQuestions.json")
	if err != nil {
		return nil, err
	}

	var questions []models.Question
	if err := json.Unmarshal(file, &questions); err != nil {
		return nil, err
	}

	return questions, nil
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
