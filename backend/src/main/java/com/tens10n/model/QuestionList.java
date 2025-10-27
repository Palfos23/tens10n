package com.tens10n.model;

import java.util.List;
import java.util.Map;

public class QuestionList {
    private List<Question> questions;
    private List<Map<String, List<String>>> answersCategories; // ← add this

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public List<Map<String, List<String>>> getAnswersCategories() {
        return answersCategories;
    }

    public void setAnswersCategories(List<Map<String, List<String>>> answersCategories) {
        this.answersCategories = answersCategories;
    }
}
