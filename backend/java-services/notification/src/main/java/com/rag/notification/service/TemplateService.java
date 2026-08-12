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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final EmailTemplateRepository templateRepository;
    private final TemplateRenderer templateRenderer;

    @Transactional
    public TemplateResponse create(CreateTemplateRequest request) {
        if (templateRepository.existsByTemplateSlug(request.templateSlug())) {
            throw new TemplateAlreadyExistsException("Template with slug '" + request.templateSlug() + "' already exists.");
        }

        EmailTemplate template = EmailTemplate.builder()
                .templateName(request.templateName())
                .templateSlug(request.templateSlug())
                .subject(request.subject())
                .body(request.body())
                .version(1)
                .status(request.status())
                .build();

        EmailTemplate saved = templateRepository.save(template);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TemplateResponse> list(Boolean status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<EmailTemplate> templatePage = (status != null)
                ? templateRepository.findByStatus(status, pageable)
                : templateRepository.findAll(pageable);

        List<TemplateResponse> content = templatePage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PagedResponse<>(
                content,
                templatePage.getNumber(),
                templatePage.getSize(),
                templatePage.getTotalElements(),
                templatePage.getTotalPages(),
                templatePage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public TemplateResponse getById(Long templateId) {
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found with ID: " + templateId));
        return mapToResponse(template);
    }

    @Transactional(readOnly = true)
    public TemplatePreviewResponse preview(Long templateId, Map<String, String> sampleData) {
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found with ID: " + templateId));

        return templateRenderer.render(template.getSubject(), template.getBody(), sampleData);
    }

    @Transactional
    public TemplateResponse updateStatus(Long templateId, Boolean status) {
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found with ID: " + templateId));

        template.setStatus(status);
        EmailTemplate updated = templateRepository.save(template);
        return mapToResponse(updated);
    }

    @Transactional
    public TemplateResponse createNewVersion(Long templateId, CreateTemplateVersionRequest request) {
        EmailTemplate currentTemplate = templateRepository.findById(templateId)
                .orElseThrow(() -> new TemplateNotFoundException("Template not found with ID: " + templateId));

        Integer maxVersion = templateRepository.findMaxVersionByTemplateSlug(currentTemplate.getTemplateSlug())
                .orElse(currentTemplate.getVersion());

        EmailTemplate newVersionTemplate = EmailTemplate.builder()
                .templateName(currentTemplate.getTemplateName())
                .templateSlug(currentTemplate.getTemplateSlug())
                .subject(request.subject())
                .body(request.body())
                .version(maxVersion + 1)
                .status(currentTemplate.getStatus())
                .build();

        EmailTemplate saved = templateRepository.save(newVersionTemplate);
        return mapToResponse(saved);
    }

    private TemplateResponse mapToResponse(EmailTemplate template) {
        return new TemplateResponse(
                template.getTemplateId(),
                template.getTemplateName(),
                template.getTemplateSlug(),
                template.getSubject(),
                template.getBody(),
                template.getVersion(),
                template.getStatus(),
                template.getCreatedAt()
        );
    }
}