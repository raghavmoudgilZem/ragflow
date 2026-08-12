package com.ragflow.retrieval.service;

import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.dto.response.SanitizedQuery;
import com.ragflow.retrieval.exception.InvalidQueryException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * No @SpringBootTest, no context loading — QuerySanitizer is a pure function
 * of its input, constructed directly.
 * <p>
 * AssertJ (assertThat / assertThatThrownBy) ships with spring-boot-starter-test
 * by default, so no extra dependency is needed to run these as-is.
 */
class QuerySanitizerTest {

    private QuerySanitizer sanitizer;

    @BeforeEach
    void setUp() {
        sanitizer = sanitizerWithMaxLength(1000);
    }

    private static QuerySanitizer sanitizerWithMaxLength(int maxQueryLength) {
        return new QuerySanitizer(new RetrievalProperties(
                new RetrievalProperties.Rrf(60),
                new RetrievalProperties.Rerank("http://localhost:9380", 2000, 4000, 50),
                new RetrievalProperties.Sanitize(maxQueryLength)));
    }

    @Test
    void nullInput_throws() {
        assertThatThrownBy(() -> sanitizer.sanitize(null))
                .isInstanceOf(InvalidQueryException.class)
                .hasMessageContaining("must not be null");
    }

    @Test
    void whitespaceOnlyInput_throwsAfterTrim() {
        assertThatThrownBy(() -> sanitizer.sanitize("     "))
                .isInstanceOf(InvalidQueryException.class)
                .hasMessageContaining("must not be empty");
    }

    @Test
    void parenthesesAndHyphens_escapedOnKeywordPathOnly() {
        SanitizedQuery result = sanitizer.sanitize("AWS (us-east-1)");
        assertThat(result.forKeywordSearch()).isEqualTo("aws \\(us\\-east\\-1\\)");
        assertThat(result.forEmbedding()).isEqualTo("AWS (us-east-1)"); // case + chars preserved
    }

    @Test
    void plusSigns_escapedOnKeywordPathOnly() {
        SanitizedQuery result = sanitizer.sanitize("C++ developer");
        assertThat(result.forKeywordSearch()).isEqualTo("c\\+\\+ developer");
        assertThat(result.forEmbedding()).isEqualTo("C++ developer");
    }

    @Test
    void fieldSyntaxColon_escaped() {
        // Unescaped, "status: active" would be read as an ES field-query
        // clause (field "status" equals "active") instead of a literal phrase.
        SanitizedQuery result = sanitizer.sanitize("status: active");
        assertThat(result.forKeywordSearch()).isEqualTo("status\\: active");
    }

    @Test
    void booleanOperators_ampersandAndPipe_escaped() {
        assertThat(sanitizer.sanitize("a && b").forKeywordSearch()).isEqualTo("a \\&\\& b");
        assertThat(sanitizer.sanitize("a || b").forKeywordSearch()).isEqualTo("a \\|\\| b");
    }

    @Test
    void nonReservedCharacters_passThroughUnescaped() {
        // '%' is NOT in the reserved set defined by the AC — only '*' should
        // get escaped here. Confirms the regex isn't over-broad.
        SanitizedQuery result = sanitizer.sanitize("50% off*");
        assertThat(result.forKeywordSearch()).isEqualTo("50% off\\*");
    }

    @Test
    void oversizedInput_truncatedBeforeEscaping() {
        String longQuery = "a".repeat(1500);
        SanitizedQuery result = sanitizer.sanitize(longQuery);
        assertThat(result.forEmbedding()).hasSize(1000);
        // No reserved characters in "a" repeated, so escaping adds no length here.
        assertThat(result.forKeywordSearch()).hasSize(1000);
    }

    @Test
    void unicodeAccentedCharacters_passThroughUntouched() {
        SanitizedQuery result = sanitizer.sanitize("café");
        assertThat(result.forKeywordSearch()).isEqualTo("café");
        assertThat(result.forEmbedding()).isEqualTo("café");
    }

    @Test
    void unicodeUppercase_lowercasedCorrectlyOnKeywordPathOnly() {
        SanitizedQuery result = sanitizer.sanitize("CAFÉ");
        assertThat(result.forKeywordSearch()).isEqualTo("café"); // Locale.ROOT case-folds accented Latin correctly
        assertThat(result.forEmbedding()).isEqualTo("CAFÉ");
    }

    @Test
    void mixedCase_lowercasedOnKeywordPathOnly() {
        SanitizedQuery result = sanitizer.sanitize("Vector SEARCH");
        assertThat(result.forKeywordSearch()).isEqualTo("vector search");
        assertThat(result.forEmbedding()).isEqualTo("Vector SEARCH");
    }

    @Test
    void literalBackslashInInput_escapedToTwoBackslashes() {
        // Input has ONE literal backslash: "back" + \ + "slash". The regex
        // matches that one backslash and replaces it with itself preceded by
        // an escaping backslash -> TWO literal backslashes in the output.
        // As a Java string literal, one actual backslash is written "\\";
        // two actual backslashes is written "\\\\" — the assertion below is
        // not a typo, it's the doubled-escaping worked through by hand.
        SanitizedQuery result = sanitizer.sanitize("back\\slash");
        assertThat(result.forKeywordSearch()).isEqualTo("back\\\\slash");
    }

    @Test
    void customMaxLength_respectedWhenConfiguredDifferently() {
        // Proves maxQueryLength is genuinely constructor-driven, not a
        // hidden hardcoded constant re-appearing under the property name.
        QuerySanitizer shortLimitSanitizer = sanitizerWithMaxLength(5);
        SanitizedQuery result = shortLimitSanitizer.sanitize("abcdefgh");
        assertThat(result.forEmbedding()).isEqualTo("abcde");
    }
}