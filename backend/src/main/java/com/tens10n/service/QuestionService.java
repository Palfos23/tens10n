package com.tens10n.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.tens10n.model.Question;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final ObjectMapper mapper;
    private final List<Question> questions = new ArrayList<>();
    private final Map<String, List<String>> categoryAnswers = new HashMap<>();

    // Disse peker på ressursmapper
    private final Path questionsDir;
    private final Path categoriesDir;

    public QuestionService(ObjectMapper mapper) throws Exception {
        this.mapper = mapper;

        // Finn ressursbaner
        this.questionsDir = getPathFromResources("/data/questions");
        this.categoriesDir = getPathFromResources("/data/categories");

        loadAllQuestions();
        loadAllCategories();
    }

    // 🔹 Laster inn alle spørsmål fra mappen
    private void loadAllQuestions() throws IOException {
        if (!Files.exists(questionsDir)) return;

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(questionsDir, "*.json")) {
            for (Path path : stream) {
                Question q = mapper.readValue(path.toFile(), Question.class);
                questions.add(q);
            }
        }
    }

    // 🔹 Laster inn alle kategorier (hver fil = én liste)
    private void loadAllCategories() throws IOException {
        if (!Files.exists(categoriesDir)) return;

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(categoriesDir, "*.json")) {
            for (Path path : stream) {
                String categoryName = stripExtension(path.getFileName().toString()).toLowerCase();
                List<String> items = Arrays.asList(mapper.readValue(path.toFile(), String[].class));
                categoryAnswers.put(categoryName, items);
            }
        }
    }

    // 🔹 Henter alle spørsmål
    public List<Question> getAllQuestions() {
        return new ArrayList<>(questions);
    }

    // 🔹 Henter spørsmål etter ID
    public Question getQuestionById(String id) {
        return questions.stream()
                .filter(q -> q.getQuestionId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    // 🔹 Henter tilfeldige spørsmål
    public List<Question> getRandomQuestions(int count) {
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);
        return shuffled.stream()
                .limit(count)
                .collect(Collectors.toList());
    }

    // 🔹 Legger til nytt spørsmål (og lagrer som ny fil)
    public Question addQuestion(Question newQuestion) throws IOException {
        questions.add(newQuestion);
        saveQuestionToFile(newQuestion);
        return newQuestion;
    }

    // 🔹 Oppdaterer eksisterende spørsmål
    public Question updateQuestion(String id, Question updatedQuestion) throws IOException {
        for (int i = 0; i < questions.size(); i++) {
            if (questions.get(i).getQuestionId().equalsIgnoreCase(id)) {
                questions.set(i, updatedQuestion);
                saveQuestionToFile(updatedQuestion);
                return updatedQuestion;
            }
        }
        return null;
    }

    // 🔹 Henter liste over svar for en gitt kategori
    public List<String> getAnswersByCategory(String category) {
        if (category == null) return Collections.emptyList();
        return categoryAnswers.getOrDefault(category.toLowerCase().trim(), Collections.emptyList());
    }

    public List<Question> getRandomQuestionsByMainCategory(String mainCategory, int count) {
        if (mainCategory == null || mainCategory.isBlank()) {
            return getRandomQuestions(count);
        }

        List<Question> filtered = questions.stream()
                .filter(q -> q.getMainCategory() != null
                        && q.getMainCategory().equalsIgnoreCase(mainCategory))
                .collect(Collectors.toList());

        Collections.shuffle(filtered);
        return filtered.stream()
                .limit(count)
                .collect(Collectors.toList());
    }

    // 🔹 Lagrer et spørsmål tilbake til sin egen fil
    private void saveQuestionToFile(Question question) throws IOException {
        if (!Files.exists(questionsDir)) {
            Files.createDirectories(questionsDir);
        }

        Path filePath = questionsDir.resolve(question.getQuestionId() + ".json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), question);
    }

    // 🔹 Hjelpemetode for å finne resource-path (fungerer i JAR og lokalt)
    private Path getPathFromResources(String resource) throws URISyntaxException, IOException {
        var uri = getClass().getResource(resource);
        if (uri == null) {
            // Hvis ikke finnes (f.eks. første gang), lag mappen under src/main/resources manuelt
            return Paths.get("src/main/resources" + resource);
        }
        return Paths.get(uri.toURI());
    }

    private String stripExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx > 0) ? filename.substring(0, idx) : filename;
    }
}