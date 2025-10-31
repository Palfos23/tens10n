package com.tens10n.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "categories")
public class AnswerCategory {
    @Id
    private String name;
    private List<String> answers;

    public AnswerCategory() {}
    public AnswerCategory(String name, List<String> answers) {
        this.name = name;
        this.answers = answers;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getAnswers() { return answers; }
    public void setAnswers(List<String> answers) { this.answers = answers; }
}

