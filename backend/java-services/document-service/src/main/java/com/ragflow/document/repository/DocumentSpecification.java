package com.ragflow.document.repository;

import com.ragflow.document.model.Document;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@UtilityClass
public class DocumentSpecification {

    public static Specification<Document> hasKbId(String kbId) {
        return (root, query, cb) -> cb.equal(root.get("kbId"), kbId);
    }

    public static Specification<Document> idIn(List<String> docIds) {
        return (root, query, cb) ->
                (docIds == null || docIds.isEmpty()) ? null : root.get("id").in(docIds);
    }

    public static Specification<Document> statusIn(List<String> runStatus) {
        return (root, query, cb) ->
                (runStatus == null || runStatus.isEmpty()) ? null : root.get("status").in(runStatus);
    }

    public static Specification<Document> typeIn(List<String> types) {
        return (root, query, cb) ->
                (types == null || types.isEmpty()) ? null : root.get("type").in(types);
    }

    public static Specification<Document> suffixIn(List<String> suffix) {
        return (root, query, cb) ->
                (suffix == null || suffix.isEmpty()) ? null : root.get("suffix").in(suffix);
    }

    public static Specification<Document> createdAfter(Long createTimeFrom) {
        return (root, query, cb) ->
                (createTimeFrom == null || createTimeFrom <= 0) ? null : cb.greaterThanOrEqualTo(root.get("created_time"), createTimeFrom);
    }

    public static Specification<Document> createdBefore(Long createTimeTo) {
        return (root, query, cb) ->
                (createTimeTo == null || createTimeTo <= 0) ? null : cb.lessThanOrEqualTo(root.get("created_time"), createTimeTo);
    }

    public static Specification<Document> nameContainsIgnoreCase(String keywords) {
        return (root, query, cb) -> {
            if (keywords == null || keywords.trim().isEmpty()) {
                return null;
            }
            return cb.like(cb.lower(root.get("name")), "%" + keywords.toLowerCase() + "%");
        };
    }

    public static Specification<Document> hasEmptyMetadata(boolean returnEmptyMetadata) {
        return (root, query, cb) -> {
            if (!returnEmptyMetadata) {
                return null; // Omit condition when false
            }
            // (metaFields IS NULL OR JSON_LENGTH(metaFields) = 0)
            return cb.or(
                    cb.isNull(root.get("metaFields")),
                    cb.equal(cb.function("JSON_LENGTH", Integer.class, root.get("metaFields")), 0)
            );
        };
    }
}
