package com.tens10n.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.tens10n.model.Question;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

@Service
public class QuestionService {

    private final ObjectMapper mapper;
    private final List<Question> questions = new ArrayList<>();
    private final Map<String, List<String>> categoryAnswers = new HashMap<>();

    private static final String QUESTIONS_PATH = "data/questions";
    private static final String CATEGORIES_PATH = "data/categories";

    public QuestionService(ObjectMapper mapper) {
        this.mapper = mapper;

        try {
            loadAllQuestions();
            loadAllCategories();
            System.out.println("✅ QuestionService initialisert med " + questions.size() + " spørsmål og " + categoryAnswers.size() + " kategorier.");
        } catch (Exception e) {
            System.err.println("⚠️ Kunne ikke laste datafiler: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🔹 Laster spørsmål
    private void loadAllQuestions() throws IOException {
        List<String> fileNames = listResourceFiles(QUESTIONS_PATH);
        for (String file : fileNames) {
            try (InputStream is = getClass().getClassLoader().getResourceAsStream(QUESTIONS_PATH + "/" + file)) {
                if (is == null) continue;
                Question q = mapper.readValue(is, Question.class);
                questions.add(q);
            }
        }
    }

    // 🔹 Laster kategorier
    private void loadAllCategories() throws IOException {
        List<String> fileNames = listResourceFiles(CATEGORIES_PATH);
        for (String file : fileNames) {
            try (InputStream is = getClass().getClassLoader().getResourceAsStream(CATEGORIES_PATH + "/" + file)) {
                if (is == null) continue;
                String name = stripExtension(file).toLowerCase();
                List<String> items = Arrays.asList(mapper.readValue(is, String[].class));
                categoryAnswers.put(name, items);
            }
        }
    }

    // 🔹 Returnerer alle spørsmål
    public List<Question> getAllQuestions() {
        return new ArrayList<>(questions);
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

    // 🔹 Les liste over filer inne i ressursmappen, fungerer både lokalt og i JAR
    private List<String> listResourceFiles(String path) throws IOException {
        List<String> result = new ArrayList<>();

        // Hvis vi kjører fra IDE (ikke JAR)
        var url = getClass().getClassLoader().getResource(path);
        if (url != null && url.getProtocol().equals("file")) {
            var dir = new java.io.File(url.getPath());
            var files = dir.list((d, name) -> name.endsWith(".json"));
            if (files != null) {
                result.addAll(Arrays.asList(files));
            }
            return result;
        }

        // Hvis vi kjører fra JAR
        var jarPath = getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
        try (JarFile jar = new JarFile(jarPath)) {
            jar.stream()
                    .map(JarEntry::getName)
                    .filter(name -> name.startsWith("BOOT-INF/classes/" + path + "/") && name.endsWith(".json"))
                    .forEach(name -> {
                        String fileName = name.substring(name.lastIndexOf('/') + 1);
                        result.add(fileName);
                    });
        } catch (Exception e) {
            System.err.println("⚠️ Kunne ikke lese fra JAR: " + e.getMessage());
        }

        return result;
    }

    private String stripExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx > 0) ? filename.substring(0, idx) : filename;
    }
}