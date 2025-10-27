package com.tens10n.controller;

import com.tens10n.service.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "*")
public class AnswersController {

    private final QuestionService questionService;

    public AnswersController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Example: GET /api/answers?category=cities
    @GetMapping
    public List<String> getAnswersByCategory(@RequestParam String category) {
        return questionService.getAnswersByCategory(category);
    }
}
