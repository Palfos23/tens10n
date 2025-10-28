package com.tens10n.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.tens10n.model.Question;

import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class QuestionService {

    private final ObjectMapper mapper;
    private final List<Question> questions = new ArrayList<>();
    private final Map<String, List<String>> categoryAnswers = new HashMap<>();

    private final String QUESTIONS_PATH = "data/questions";
    private final String CATEGORIES_PATH = "data/categories";

    public QuestionService(ObjectMapper mapper) {
        this.mapper = mapper;

        try {
            loadAllQuestions();
            loadAllCategories();
            System.out.println("✅ QuestionService initialisert OK");
        } catch (Exception e) {
            System.err.println("⚠️ Kunne ikke laste spørsmål/kategorier: " + e.getMessage());
            e.printStackTrace();
        }
    }


    // 🔹 Laster inn alle spørsmål fra ressursmappen
    private void loadAllQuestions() throws IOException {
        List<String> files = listResourceFiles(QUESTIONS_PATH);
        for (String filename : files) {
            if (!filename.endsWith(".json")) continue;

            try (InputStream is = getResourceAsStream(QUESTIONS_PATH + "/" + filename)) {
                if (is == null) continue;
                Question q = mapper.readValue(is, Question.class);
                questions.add(q);
            } catch (IOException e) {
                System.err.println("❌ Kunne ikke lese spørsmål: " + filename);
                e.printStackTrace();
            }
        }
        System.out.println("✅ Lastet " + questions.size() + " spørsmål");
    }

    // 🔹 Laster inn alle kategorier
    private void loadAllCategories() throws IOException {
        List<String> files = listResourceFiles(CATEGORIES_PATH);
        for (String filename : files) {
            if (!filename.endsWith(".json")) continue;

            try (InputStream is = getResourceAsStream(CATEGORIES_PATH + "/" + filename)) {
                if (is == null) continue;
                String categoryName = stripExtension(filename).toLowerCase();
                List<String> items = Arrays.asList(mapper.readValue(is, String[].class));
                categoryAnswers.put(categoryName, items);
            } catch (IOException e) {
                System.err.println("❌ Kunne ikke lese kategori: " + filename);
                e.printStackTrace();
            }
        }
        System.out.println("✅ Lastet " + categoryAnswers.size() + " kategorier");
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

    // 🔹 Oppdaterer eller legger til spørsmål (kun i runtime – ikke til fil)
    public Question addOrUpdateQuestion(Question question) {
        questions.removeIf(q -> q.getQuestionId().equalsIgnoreCase(question.getQuestionId()));
        questions.add(question);
        return question;
    }

    // 🔹 Henter svar for kategori
    public List<String> getAnswersByCategory(String category) {
        if (category == null) return Collections.emptyList();
        return categoryAnswers.getOrDefault(category.toLowerCase().trim(), Collections.emptyList());
    }

    // 🔹 Henter tilfeldige spørsmål fra hovedkategori
    public List<Question> getRandomQuestionsByMainCategory(String mainCategory, int count) {
        if (mainCategory == null || mainCategory.isBlank()) {
            return getRandomQuestions(count);
        }

        List<Question> filtered = questions.stream()
                .filter(q -> q.getMainCategory() != null &&
                        q.getMainCategory().equalsIgnoreCase(mainCategory))
                .collect(Collectors.toList());

        Collections.shuffle(filtered);
        return filtered.stream()
                .limit(count)
                .collect(Collectors.toList());
    }

    // 🔹 Hjelpemetode for å liste filer i ressursmappen
    private List<String> listResourceFiles(String folder) throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(folder)) {
            // Hvis selve mappen ikke finnes, returner tom liste
            if (in == null) {
                return Collections.emptyList();
            }
        }

        try (var stream = getResourceListing(folder)) {
            if (stream == null) return Collections.emptyList();
            return stream.collect(Collectors.toList());
        }
    }

    // 🔹 Hjelpemetode for å få stream av filnavn fra en ressursmappe
    private Stream<String> getResourceListing(String path) throws IOException {
        try {
            var uri = getClass().getClassLoader().getResource(path);
            if (uri == null) return Stream.empty();

            if (uri.getProtocol().equals("jar")) {
                // Leser fra JAR
                var jarPath = uri.toString().split("!")[0].replace("jar:file:", "");
                try (FileSystem fs = FileSystems.newFileSystem(Paths.get(jarPath))) {
                    Path folderPath = fs.getPath("/BOOT-INF/classes/" + path);
                    if (!Files.exists(folderPath)) return Stream.empty();
                    return Files.list(folderPath)
                            .map(p -> p.getFileName().toString());
                }
            } else {
                // Leser fra vanlig filsystem (lokalt)
                Path dir = Paths.get(uri.toURI());
                if (!Files.exists(dir)) return Stream.empty();
                return Files.list(dir)
                        .map(p -> p.getFileName().toString());
            }
        } catch (URISyntaxException e) {
            throw new IOException("Feil ved lesing av ressursmappe: " + path, e);
        }
    }

    // 🔹 Leser enkeltfil som stream
    private InputStream getResourceAsStream(String path) {
        return getClass().getClassLoader().getResourceAsStream(path);
    }

    private String stripExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx > 0) ? filename.substring(0, idx) : filename;
    }
}