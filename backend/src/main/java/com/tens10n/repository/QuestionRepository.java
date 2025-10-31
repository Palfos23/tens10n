package com.tens10n.repository;

import com.tens10n.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByMainCategoryIgnoreCase(String mainCategory);
}
