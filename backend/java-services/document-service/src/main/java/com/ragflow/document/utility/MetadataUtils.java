package com.ragflow.document.utility;

import com.ragflow.document.dto.response.MetadataFilterCondition;
import lombok.experimental.UtilityClass;

import java.util.*;

@UtilityClass
public class MetadataUtils {

    public List<MetadataFilterCondition> convertConditions(Map<String, Object> metadataCondition) {

        // 1. Handle None / null
        if (metadataCondition == null || metadataCondition.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Safely extract the "conditions" list
        Object conditionsObj = metadataCondition.get("conditions");
        if (!(conditionsObj instanceof List)) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> conditions = (List<Map<String, Object>>) conditionsObj;

        // 3. Replicate the list comprehension
        return conditions.stream()
                .map(cond -> {

                    // Extract the original operator safely
                    String originalOp = (String) cond.get("comparison_operator");
                    String mappedOp = switch (originalOp == null ? "" : originalOp) {
                        case "is" -> "=";
                        case "not is" -> "≠";
                        default -> originalOp;
                    };

                    return new MetadataFilterCondition(cond.get("name").toString(), mappedOp, cond.get("value"));}
                ).toList(); // or .toList() if using Java 16+
    }

    public Set<String> metaFilter(Map<String, Map<String, List<String>>> metas, List<MetadataFilterCondition> filters, String logic) {
        if (filters == null || filters.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> finalDocIds = null;
        boolean isAnd = "and".equalsIgnoreCase(logic);

        for (MetadataFilterCondition filter : filters) {
            String key = filter.key();
            String operator = filter.operator() != null ? filter.operator().toLowerCase() : "";
            Object expectedValue = filter.value();

            // Get the inverted index for this specific metadata key
            Map<String, List<String>> v2docs = metas.getOrDefault(key, Collections.emptyMap());

            // Get all matching IDs for this specific filter
            Set<String> matchedIds = filterOut(v2docs, operator, expectedValue);

            // Apply AND/OR logic
            if (finalDocIds == null) {
                finalDocIds = new HashSet<>(matchedIds);
            } else {
                if (isAnd) {
                    finalDocIds.retainAll(matchedIds); // Intersection
                } else {
                    finalDocIds.addAll(matchedIds);    // Union
                }
            }

            // Short-circuit: If AND logic results in empty set, we can stop evaluating
            if (isAnd && finalDocIds.isEmpty()) {
                break;
            }
        }

        return finalDocIds != null ? finalDocIds : Collections.emptySet();
    }

    /**
     * Replicates the inner filter_out method.
     */
    private Set<String> filterOut(Map<String, List<String>> v2docs, String operator, Object expectedValue) {
        Set<String> ids = new HashSet<>();

        for (Map.Entry<String, List<String>> entry : v2docs.entrySet()) {
            String inputStr = entry.getKey();
            List<String> docIds = entry.getValue();
            boolean matched = false;

            try {
                matched = evaluateCondition(inputStr, operator, expectedValue);
            } catch (Exception e) {
                // Mimics Python's `except Exception: pass`
                matched = false;
            }

            if (matched) {
                ids.addAll(docIds);
            }
        }

        return ids;
    }

    /**
     * Core evaluation logic handling type coercion and operator matching.
     */
    @SuppressWarnings("unchecked")
    private boolean evaluateCondition(String inputStr, String operator, Object value) {
        // Handle Empty / Not Empty
        if ("empty".equals(operator)) {
            return inputStr == null || inputStr.trim().isEmpty();
        }
        if ("not empty".equals(operator)) {
            return inputStr != null && !inputStr.trim().isEmpty();
        }

        if (inputStr == null || value == null) return false;

        // String preparation for textual operators
        String inputLower = inputStr.toLowerCase();
        String valueLower = String.valueOf(value).toLowerCase();

        switch (operator) {
            case "contains":
                return inputLower.contains(valueLower);
            case "not contains":
                return !inputLower.contains(valueLower);
            case "start with":
                return inputLower.startsWith(valueLower);
            case "end with":
                return inputLower.endsWith(valueLower);
            case "in":
                if (value instanceof List) {
                    return ((List<Object>) value).stream()
                            .map(v -> String.valueOf(v).toLowerCase())
                            .anyMatch(inputLower::equals);
                }
                return valueLower.contains(inputLower);
            case "not in":
                if (value instanceof List) {
                    return ((List<Object>) value).stream()
                            .map(v -> String.valueOf(v).toLowerCase())
                            .noneMatch(inputLower::equals);
                }
                return !valueLower.contains(inputLower);
        }

        // --- Relational Operators (=, ≠, >, <, ≥, ≤) ---
        // Attempt numeric comparison first, fallback to string comparison
        Double inputNum = tryParseDouble(inputStr);
        Double valueNum = null;
        if (value instanceof Number) {
            valueNum = ((Number) value).doubleValue();
        } else {
            valueNum = tryParseDouble(String.valueOf(value));
        }

        if (inputNum != null && valueNum != null) {
            int cmp = Double.compare(inputNum, valueNum);
            return switch (operator) {
                case "=" -> cmp == 0;
                case "≠" -> cmp != 0;
                case ">" -> cmp > 0;
                case "<" -> cmp < 0;
                case "≥" -> cmp >= 0;
                case "≤" -> cmp <= 0;
                default -> false;
            };
        } else {
            // Fallback to String lexicographical comparison
            int cmp = inputLower.compareTo(valueLower);
            return switch (operator) {
                case "=" -> cmp == 0;
                case "≠" -> cmp != 0;
                case ">" -> cmp > 0;
                case "<" -> cmp < 0;
                case "≥" -> cmp >= 0;
                case "≤" -> cmp <= 0;
                default -> false;
            };
        }
    }

    private Double tryParseDouble(String str) {
        try {
            return Double.parseDouble(str);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
