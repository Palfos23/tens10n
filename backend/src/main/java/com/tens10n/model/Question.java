package com.tens10n.model;

import java.util.List;
import java.util.Map;

public class Question {
    private String questionId;
    private String title;
    private int numTensionAnswers;
    private Map<String, String> answers;
    private Map<String, String> tensionAnswers;

    // Getters and Setters
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getNumTensionAnswers() { return numTensionAnswers; }
    public void setNumTensionAnswers(int numTensionAnswers) { this.numTensionAnswers = numTensionAnswers; }

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }

    public Map<String, String> getTensionAnswers() { return tensionAnswers; }
    public void setTensionAnswers(Map<String, String> tensionAnswers) { this.tensionAnswers = tensionAnswers; }

}
