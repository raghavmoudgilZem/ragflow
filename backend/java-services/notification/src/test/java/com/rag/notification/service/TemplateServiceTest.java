package com.rag.notification.service;

import com.rag.notification.dto.request.CreateTemplateRequest;
import com.rag.notification.dto.request.CreateTemplateVersionRequest;
import com.rag.notification.dto.response.PagedResponse;
import com.rag.notification.dto.response.TemplatePreviewResponse;
import com.rag.notification.dto.response.TemplateResponse;
import com.rag.notification.entity.EmailTemplate;
import com.rag.notification.exception.TemplateAlreadyExistsException;
import com.rag.notification.exception.TemplateNotFoundException;
import com.rag.notification.repository.EmailTemplateRepository;
import com.rag.notification.util.TemplateRenderer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TemplateServiceTest {

    @Mock
    private EmailTemplateRepository templateRepository;

    @Mock
    private TemplateRenderer templateRenderer;

    @InjectMocks
    private TemplateService templateService;

    private EmailTemplate sampleTemplate;

    @BeforeEach
    void setUp() {
        sampleTemplate = EmailTemplate.builder()
                .templateId(1L)
                .templateName("Welcome Onboarding")
                .templateSlug("welcome_onboarding_v1")
                .subject("Welcome {{first_name}}!")
                .body("Hi {{first_name}}, verify link: {{link}}")
                .version(1)
                .status(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully create a template when slug is unique")
    void create_Success() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "Welcome Onboarding", "welcome_onboarding_v1", "Welcome {{first_name}}!", "Hi {{first_name}}", true
        );

        when(templateRepository.existsByTemplateSlug("welcome_onboarding_v1")).thenReturn(false);
        when(templateRepository.save(any(EmailTemplate.class))).thenReturn(sampleTemplate);

        TemplateResponse response = templateService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.templateId()).isEqualTo(1L);
        assertThat(response.version()).isEqualTo(1);
        verify(templateRepository, times(1)).save(any(EmailTemplate.class));
    }

    @Test
    @DisplayName("Should throw TemplateAlreadyExistsException when slug exists")
    void create_ThrowsAlreadyExistsException() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "Welcome Onboarding", "welcome_onboarding_v1", "Welcome!", "Body", true
        );

        when(templateRepository.existsByTemplateSlug("welcome_onboarding_v1")).thenReturn(true);

        assertThatThrownBy(() -> templateService.create(request))
                .isInstanceOf(TemplateAlreadyExistsException.class)
                .hasMessageContaining("welcome_onboarding_v1");

        verify(templateRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return template by ID")
    void getById_Success() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(sampleTemplate));

        TemplateResponse response = templateService.getById(1L);

        assertThat(response.templateId()).isEqualTo(1L);
        assertThat(response.templateSlug()).isEqualTo("welcome_onboarding_v1");
    }

    @Test
    @DisplayName("Should throw TemplateNotFoundException when ID is invalid")
    void getById_NotFound() {
        when(templateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> templateService.getById(99L))
                .isInstanceOf(TemplateNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Should list all templates with pagination when status filter is null")
    void list_All_WithPagination() {
        Page<EmailTemplate> templatePage = new PageImpl<>(List.of(sampleTemplate));
        when(templateRepository.findAll(any(Pageable.class))).thenReturn(templatePage);

        PagedResponse<TemplateResponse> response = templateService.list(null, 0, 10, "createdAt", "desc");

        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(1);
        verify(templateRepository, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("Should filter templates by status with pagination")
    void list_ByStatus_WithPagination() {
        Page<EmailTemplate> templatePage = new PageImpl<>(List.of(sampleTemplate));
        when(templateRepository.findByStatus(eq(true), any(Pageable.class))).thenReturn(templatePage);

        PagedResponse<TemplateResponse> response = templateService.list(true, 0, 10, "createdAt", "desc");

        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
        verify(templateRepository, times(1)).findByStatus(eq(true), any(Pageable.class));
    }

    @Test
    @DisplayName("Should successfully preview template with sample data")
    void preview_Success() {
        Map<String, String> sampleData = Map.of("first_name", "Alex");
        TemplatePreviewResponse expectedPreview = new TemplatePreviewResponse("Welcome Alex!", "Hi Alex");

        when(templateRepository.findById(1L)).thenReturn(Optional.of(sampleTemplate));
        when(templateRenderer.render(eq(sampleTemplate.getSubject()), eq(sampleTemplate.getBody()), eq(sampleData)))
                .thenReturn(expectedPreview);

        TemplatePreviewResponse response = templateService.preview(1L, sampleData);

        assertThat(response.subject()).isEqualTo("Welcome Alex!");
    }

    @Test
    @DisplayName("Should update template status")
    void updateStatus_Success() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(sampleTemplate));
        when(templateRepository.save(any(EmailTemplate.class))).thenReturn(sampleTemplate);

        TemplateResponse response = templateService.updateStatus(1L, false);

        verify(templateRepository).save(argThat(t -> !t.getStatus()));
    }

    @Test
    @DisplayName("Should create a new version incremented from current max version")
    void createNewVersion_Success() {
        CreateTemplateVersionRequest versionRequest = new CreateTemplateVersionRequest(
                "New Subject", "New Body"
        );

        when(templateRepository.findById(1L)).thenReturn(Optional.of(sampleTemplate));
        when(templateRepository.findMaxVersionByTemplateSlug("welcome_onboarding_v1")).thenReturn(Optional.of(1));

        EmailTemplate v2Template = EmailTemplate.builder()
                .templateId(2L)
                .templateName(sampleTemplate.getTemplateName())
                .templateSlug(sampleTemplate.getTemplateSlug())
                .subject("New Subject")
                .body("New Body")
                .version(2)
                .status(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(templateRepository.save(any(EmailTemplate.class))).thenReturn(v2Template);

        TemplateResponse response = templateService.createNewVersion(1L, versionRequest);

        ArgumentCaptor<EmailTemplate> captor = ArgumentCaptor.forClass(EmailTemplate.class);
        verify(templateRepository).save(captor.capture());

        EmailTemplate captured = captor.getValue();
        assertThat(captured.getVersion()).isEqualTo(2);
        assertThat(captured.getSubject()).isEqualTo("New Subject");
        assertThat(response.version()).isEqualTo(2);
    }
}