package com.tens10n.controller;

import com.tens10n.model.Question;
import com.tens10n.service.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    // Get random questions, optionally filtered by mainCategory
    @GetMapping("/random")
    public List<Question> getRandomQuestions(
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(required = false) String category) {

        if (category != null && !category.isBlank()) {
            return questionService.getRandomQuestionsByMainCategory(category, count);
        }

        return questionService.getRandomQuestions(count);
    }

    @GetMapping("/{id}")
    public Question getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id);
    }

    // 🔹 Bruker addOrUpdateQuestion i stedet for addQuestion
    @PostMapping
    public Question addQuestion(@RequestBody Question question) throws Exception {
        return questionService.addOrUpdateQuestion(question);
    }

    // 🔹 Bruker samme metode, men setter ID manuelt
    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable String id, @RequestBody Question question) throws Exception {
        question.setQuestionId(id);
        return questionService.addOrUpdateQuestion(question);
    }
}