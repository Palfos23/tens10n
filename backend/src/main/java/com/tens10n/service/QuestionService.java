package com.tens10n.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.tens10n.model.*;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final ObjectMapper mapper;
    private final List<Question> questions;
    private final File questionFile;

    public QuestionService(ObjectMapper mapper) throws Exception {
        this.mapper = mapper;
        InputStream is = getClass().getResourceAsStream("/quiz.json");
        QuestionList questionList = mapper.readValue(is, QuestionList.class);
        this.questions = questionList.getQuestions();

        // Locate file path for saving updates
        this.questionFile = Paths.get("src/main/resources/quiz.json").toFile();
    }

    public List<Question> getAllQuestions() {
        return questions;
    }

    public Question getQuestionById(String id) {
        return questions.stream()
                .filter(q -> q.getQuestionId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    public List<Question> getRandomQuestions(int count) {
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);
        return shuffled.stream()
                .limit(count)
                .collect(Collectors.toList());
    }

    public Question addQuestion(Question newQuestion) throws Exception {
        questions.add(newQuestion);
        saveToFile();
        return newQuestion;
    }

    public Question updateQuestion(String id, Question updatedQuestion) throws Exception {
        for (int i = 0; i < questions.size(); i++) {
            if (questions.get(i).getQuestionId().equalsIgnoreCase(id)) {
                questions.set(i, updatedQuestion);
                saveToFile();
                return updatedQuestion;
            }
        }
        return null;
    }

    private void saveToFile() throws Exception {
        QuestionList updatedList = new QuestionList();
        updatedList.setQuestions(questions);
        mapper.writerWithDefaultPrettyPrinter().writeValue(questionFile, updatedList);
    }
}

