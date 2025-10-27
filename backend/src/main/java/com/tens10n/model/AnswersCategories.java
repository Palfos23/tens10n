package com.tens10n.model;

import java.util.List;
import java.util.Map;

public class AnswersCategories {
    // A map like { "cities": [ ... ], "countries": [ ... ] }
    private Map<String, List<String>> categories;

    public Map<String, List<String>> getCategories() {
        return categories;
    }

    public void setCategories(Map<String, List<String>> categories) {
        this.categories = categories;
    }

    public List<String> getCategory(String name) {
        return categories.get(name);
    }
}