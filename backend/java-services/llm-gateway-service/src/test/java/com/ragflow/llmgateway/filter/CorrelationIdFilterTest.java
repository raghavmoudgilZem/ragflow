package com.ragflow.llmgateway.filter;

import com.ragflow.llmgateway.constants.HeaderConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link CorrelationIdFilter}.
 */
class CorrelationIdFilterTest {

    private static final Pattern UUID_PATTERN =
            Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");

    private final CorrelationIdFilter filter = new CorrelationIdFilter();

    @Test
    void reusesTheIncomingCorrelationIdHeader() throws ServletException, IOException {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HeaderConstants.CORRELATION_ID, "caller-supplied-id");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        // Act
        filter.doFilter(request, response, chain);

        // Assert
        assertThat(response.getHeader(HeaderConstants.CORRELATION_ID)).isEqualTo("caller-supplied-id");
        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    void generatesAUuid_whenNoHeaderIsPresent() throws ServletException, IOException {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        // Act
        filter.doFilter(request, response, chain);

        // Assert
        String generated = response.getHeader(HeaderConstants.CORRELATION_ID);
        assertThat(generated).isNotNull();
        assertThat(UUID_PATTERN.matcher(generated).matches()).isTrue();
    }

    @Test
    void generatesAUuid_whenHeaderIsBlank() throws ServletException, IOException {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HeaderConstants.CORRELATION_ID, "   ");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        // Act
        filter.doFilter(request, response, chain);

        // Assert
        String generated = response.getHeader(HeaderConstants.CORRELATION_ID);
        assertThat(UUID_PATTERN.matcher(generated).matches()).isTrue();
    }

    @Test
    void putsTheCorrelationIdInMdcForTheDurationOfTheRequest() throws ServletException, IOException {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HeaderConstants.CORRELATION_ID, "trace-123");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> mdcDuringChain = new AtomicReference<>();
        FilterChain chain = (req, res) -> mdcDuringChain.set(MDC.get("correlationId"));

        // Act
        filter.doFilter(request, response, chain);

        // Assert
        assertThat(mdcDuringChain.get()).isEqualTo("trace-123");
    }

    @Test
    void clearsMdcAfterTheChainCompletesSuccessfully() throws ServletException, IOException {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        // Act
        filter.doFilter(request, response, chain);

        // Assert — MDC must not leak into whatever request the pooled thread handles next
        assertThat(MDC.get("correlationId")).isNull();
    }

    @Test
    void clearsMdcEvenWhenTheChainThrows() {
        // Arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            throw new ServletException("downstream failure");
        };

        // Act
        assertThatThrownBy(() -> filter.doFilter(request, response, chain))
                .isInstanceOf(ServletException.class);

        // Assert
        assertThat(MDC.get("correlationId")).isNull();
    }
}
