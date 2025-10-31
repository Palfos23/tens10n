package com.tens10n.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "questions")
public class Question {
    @Id
    private String questionId;
    private String title;
    private int numTensionAnswers;
    private String mainCategory;
    private Map<String, String> answers;
    private Map<String, String> tensionAnswers;
    private String answersCategory;

    // Getters & setters
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getNumTensionAnswers() { return numTensionAnswers; }
    public void setNumTensionAnswers(int numTensionAnswers) { this.numTensionAnswers = numTensionAnswers; }
    public String getMainCategory() { return mainCategory; }
    public void setMainCategory(String mainCategory) { this.mainCategory = mainCategory; }
    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }
    public Map<String, String> getTensionAnswers() { return tensionAnswers; }
    public void setTensionAnswers(Map<String, String> tensionAnswers) { this.tensionAnswers = tensionAnswers; }
    public String getAnswersCategory() { return answersCategory; }
    public void setAnswersCategory(String answersCategory) { this.answersCategory = answersCategory; }
}