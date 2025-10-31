package com.tens10n.service;

import com.tens10n.model.AnswerCategory;
import com.tens10n.model.Question;
import com.tens10n.repository.AnswerCategoryRepository;
import com.tens10n.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerCategoryRepository categoryRepository;

    public QuestionService(QuestionRepository questionRepository,
                           AnswerCategoryRepository categoryRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        System.out.println("✅ QuestionService connected to MongoDB.");
    }

    // --- QUESTIONS ---

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Question getQuestionById(String id) {
        return questionRepository.findById(id).orElse(null);
    }

    public List<Question> getRandomQuestions(int count) {
        List<Question> all = questionRepository.findAll();
        Collections.shuffle(all);
        return all.stream().limit(count).collect(Collectors.toList());
    }

    public List<Question> getRandomQuestionsByMainCategory(String mainCategory, int count) {
        List<Question> filtered = questionRepository.findByMainCategoryIgnoreCase(mainCategory);
        Collections.shuffle(filtered);
        return filtered.stream().limit(count).collect(Collectors.toList());
    }

    public Question addOrUpdateQuestion(Question question) {
        return questionRepository.save(question);
    }

    // --- CATEGORIES ---

    public List<String> getAnswersByCategory(String category) {
        return categoryRepository.findById(category.toLowerCase())
                .map(AnswerCategory::getAnswers)
                .orElse(Collections.emptyList());
    }

    public List<AnswerCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}