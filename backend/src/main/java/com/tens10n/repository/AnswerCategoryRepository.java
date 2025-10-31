package com.tens10n.repository;

import com.tens10n.model.AnswerCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnswerCategoryRepository extends MongoRepository<AnswerCategory, String> {
}