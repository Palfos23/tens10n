package com.tens10n.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tens10n.model.Question;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final ObjectMapper mapper;
    private final List<Question> questions = new ArrayList<>();
    private final Map<String, List<String>> categoryAnswers = new HashMap<>();

    private static final String QUESTIONS_PATH = "classpath:data/questions/*.json";
    private static final String CATEGORIES_PATH = "classpath:data/categories/*.json";

    public QuestionService(ObjectMapper mapper) {
        this.mapper = mapper;
        try {
            loadAllQuestions();
            loadAllCategories();
            System.out.println("✅ QuestionService initialisert med " +
                    questions.size() + " spørsmål og " + categoryAnswers.size() + " kategorier.");
        } catch (Exception e) {
            System.err.println("⚠️ Kunne ikke laste datafiler: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🔹 Laster spørsmål via Spring ResourceResolver
    private void loadAllQuestions() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources(QUESTIONS_PATH);

        for (Resource resource : resources) {
            try (InputStream is = resource.getInputStream()) {
                Question q = mapper.readValue(is, Question.class);
                questions.add(q);
            } catch (Exception e) {
                System.err.println("⚠️ Kunne ikke lese spørsmål: " + resource.getFilename());
            }
        }
    }

    // 🔹 Laster kategorier via Spring ResourceResolver
    private void loadAllCategories() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources(CATEGORIES_PATH);

        for (Resource resource : resources) {
            try (InputStream is = resource.getInputStream()) {
                String name = stripExtension(resource.getFilename()).toLowerCase();
                List<String> items = Arrays.asList(mapper.readValue(is, String[].class));
                categoryAnswers.put(name, items);
            } catch (Exception e) {
                System.err.println("⚠️ Kunne ikke lese kategori: " + resource.getFilename());
            }
        }
    }

    // 🔹 Spørsmål-API-metoder
    public List<Question> getAllQuestions() { return new ArrayList<>(questions); }

    public Question getQuestionById(String id) {
        return questions.stream()
                .filter(q -> q.getQuestionId().equalsIgnoreCase(id))
                .findFirst().orElse(null);
    }

    public List<Question> getRandomQuestions(int count) {
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);
        return shuffled.stream().limit(count).collect(Collectors.toList());
    }

    public List<Question> getRandomQuestionsByMainCategory(String mainCategory, int count) {
        if (mainCategory == null || mainCategory.isBlank()) {
            return getRandomQuestions(count);
        }
        List<Question> filtered = questions.stream()
                .filter(q -> q.getMainCategory() != null &&
                        q.getMainCategory().equalsIgnoreCase(mainCategory))
                .collect(Collectors.toList());
        Collections.shuffle(filtered);
        return filtered.stream().limit(count).collect(Collectors.toList());
    }

    public List<String> getAnswersByCategory(String category) {
        if (category == null) return Collections.emptyList();
        return categoryAnswers.getOrDefault(category.toLowerCase().trim(), Collections.emptyList());
    }

    public Question addOrUpdateQuestion(Question question) {
        if (question == null || question.getQuestionId() == null || question.getQuestionId().isBlank()) {
            throw new IllegalArgumentException("Question ID kan ikke være tomt");
        }
        questions.removeIf(q -> q.getQuestionId().equalsIgnoreCase(question.getQuestionId()));
        questions.add(question);
        System.out.println("💾 Spørsmål lagret/oppdatert: " + question.getQuestionId());
        return question;
    }

    private String stripExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx > 0) ? filename.substring(0, idx) : filename;
    }
}