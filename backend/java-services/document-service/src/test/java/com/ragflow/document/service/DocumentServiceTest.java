package com.ragflow.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.*;

import com.ragflow.document.client.FileServiceClient;
import com.ragflow.document.client.KnowledgebaseServiceClient;
import com.ragflow.document.client.UserTenantServiceClient;
import com.ragflow.document.dto.DocumentDto;
import com.ragflow.document.dto.KnowledgebaseDto;
import com.ragflow.document.dto.request.DocumentCreateRequest;
import com.ragflow.document.dto.request.DocumentListRequest;
import com.ragflow.document.dto.response.*;
import com.ragflow.document.model.Document;
import com.ragflow.document.model.File2Document;
import com.ragflow.document.repository.DocumentRepository;
import com.ragflow.document.repository.File2DocumentRepository;

import java.io.ByteArrayInputStream;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

  @Mock private KnowledgebaseServiceClient kbClient;
  @Mock private FileServiceClient fileClient;
  @Mock private UserTenantServiceClient tenantClient;
  @Mock private DocumentRepository documentRepository;
  @Mock private File2DocumentRepository file2DocumentRepository;

  @Spy @InjectMocks private DocumentService documentService;

  private static final String USER_ID = "user123";
  private static final String TENANT_ID = "5e869f637a8d11f190c1e2c726cbd5c8";
  private static final String KB_ID = "3d5795117a9211f1b0a0e2c726cbd5c8";
  private static final String KB_NAME = "Handbook";

  private static KnowledgebaseDto kb;
  private static FileResponse fileResponse;
  private static Document saved;

  @BeforeEach
  void setup(){
      kb =KnowledgebaseDto.builder().id(KB_ID).tenantId(TENANT_ID).name(KB_NAME).parserId("naive").build();

      fileResponse = FileResponse.builder()
              .id("c384bbd2884011f185c99e03f2d816fe")
              .tenantId("5e869f637a8d11f190c1e2c726cbd5c8")
              .parentId("47c887b47a9211f1b5d9e2c726cbd5c8")
              .createdBy("5e869f637a8d11f190c1e2c726cbd5c8")
              .name("Testing file")
              .type("folder")
              .size(0L)
              .location("")
              .sourceType("knowledgebase")
              .build();

      saved = new Document();
      saved.setId("doc-1");
      saved.setKbId(KB_ID);
      saved.setLocation("location");
      saved.setStatus(0);
      saved.setChunkNum(0);
  }

  @Test
  void shouldCreateDocumentSuccessfully() {

    DocumentCreateRequest request = new DocumentCreateRequest("test.pdf", KB_ID);

    given(kbClient.getKbById(KB_ID)).willReturn(kb);
    given(documentRepository.existsByNameAndKbId("test.pdf", KB_ID)).willReturn(false);
    given(fileClient.getKbFolder(kb.tenantId(), kb.name())).willReturn(fileResponse);
    given(documentRepository.save(any(Document.class))).willReturn(saved);
    given(file2DocumentRepository.existsByDocumentId("doc-1")).willReturn(false);

    Document result = documentService.createDocument(request, USER_ID);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo("doc-1");
    then(documentRepository).should().save(any(Document.class));
    then(file2DocumentRepository).should().save(any(File2Document.class));
  }

  @Test
  void shouldThrowWhenKbNotFound() {

    DocumentCreateRequest request = new DocumentCreateRequest("test.pdf", KB_ID);

    given(kbClient.getKbById(KB_ID)).willReturn(null);

    assertThatThrownBy(() -> documentService.createDocument(request, USER_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Can't find this dataset!");

    then(documentRepository).shouldHaveNoInteractions();
  }

  @Test
  void shouldThrowWhenDocumentAlreadyExists() {

    DocumentCreateRequest request = new DocumentCreateRequest("test.pdf", KB_ID);

    given(kbClient.getKbById(KB_ID)).willReturn(kb);
    given(documentRepository.existsByNameAndKbId("test.pdf", KB_ID)).willReturn(true);

    assertThatThrownBy(() -> documentService.createDocument(request, USER_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Duplicated document");
  }

  @Test
  void shouldGenerateDuplicateFilename() {
    given(documentRepository.existsByNameAndKbId("test.pdf", KB_ID)).willReturn(true, false);

    String result = documentService.duplicateName("test.pdf", KB_ID);

    assertThat(result).isEqualTo("test(1).pdf");
  }

  @Test
  void shouldRejectBlankFilename() {

    assertThatThrownBy(() -> documentService.duplicateName("", KB_ID))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Filename cannot be null or blank.");
  }

  @Test
  void shouldDownloadDocument() {

    FileDownloadResponse response =
        new FileDownloadResponse(
            new ByteArrayInputStream("hello".getBytes()), 5, "application/pdf", "test.pdf");

    File2Document mapping = new File2Document();
    mapping.setFileId("file-1");
    mapping.setDocumentId("doc-1");

    given(documentRepository.findById("doc-1")).willReturn(Optional.of(saved));
    given(file2DocumentRepository.findByDocumentId("doc-1")).willReturn(List.of(mapping));
    given(fileClient.getFileById("file-1")).willReturn(fileResponse);
    given(fileClient.downloadFile(anyString(), anyString())).willReturn(response);

    FileDownloadResponse result = documentService.downloadDocument("doc-1");

    assertThat(result).isNotNull();
    then(fileClient).should().downloadFile(anyString(), anyString());
  }

  @Test
  void shouldRemoveDocumentSuccessfully() throws Exception {

    given(documentRepository.findById("doc-1")).willReturn(Optional.of(saved));
    given(tenantClient.accessible4deletion(KB_ID, USER_ID)).willReturn(List.of(KB_ID));
    given(documentRepository.existsByKbIdIn(List.of(KB_ID))).willReturn(true);
    given(fileClient.deleteDocs(List.of("doc-1"), USER_ID)).willReturn(null);

    String result = documentService.removeDocument(List.of("doc-1"), USER_ID);

    assertThat(result).isNull();
  }

  @Test
  void shouldChangeDocumentStatus() {

    Document doc = new Document();
    doc.setId("doc-1");
    doc.setKbId(KB_ID);
    doc.setStatus(0);
    doc.setChunkNum(0);

    given(documentRepository.findById("doc-1")).willReturn(Optional.of(doc));
    given(kbClient.accessibleKb(KB_ID, USER_ID)).willReturn(List.of(KB_ID));
    given(documentRepository.existsByKbIdIn(List.of(KB_ID))).willReturn(true);

    Map<String, Map<String, String>> result =
        documentService.changeDocumentStatus(List.of("doc-1"), 1, USER_ID);

    assertThat(result.get("success")).containsKey("doc-1");
    then(documentRepository).should().save(doc);
  }

  @Test
  void shouldProcessFileUploadSuccessfully() {

    MockMultipartFile multipartFile =
        new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

    UploadStorageResponse storageResponse = new UploadStorageResponse("Test", "pdf","Test.pdf", 3473, "thumbnail_"+"doc-1"+".png", "naive");

    given(kbClient.getKbById(KB_ID)).willReturn(kb);
    given(tenantClient.checkKbTeamPermission(kb, USER_ID)).willReturn(true);
    given(fileClient.initializeKnowledgeBaseFolder(any())).willReturn(fileResponse);
    given(documentRepository.existsByNameAndKbId(anyString(), eq(KB_ID))).willReturn(false);
    given(documentRepository.save(any(Document.class))).willReturn(saved);
    given(fileClient.uploadKnowledgeBaseFile(eq(multipartFile), eq(KB_ID), eq("doc-1")))
        .willReturn(storageResponse);

    FileUploadResponse result =
        documentService.processFileUpload(KB_ID, List.of(multipartFile), USER_ID);

    assertThat(result.files()).contains("test.pdf");
    assertThat(result.errors()).isEmpty();

    then(documentRepository).should(times(2)).save(any(Document.class));
    then(file2DocumentRepository).should().save(any(File2Document.class));
  }

  @Test
  void shouldFailUploadWhenKbDoesNotExist() {

    MockMultipartFile file =
        new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

    given(kbClient.getKbById(KB_ID)).willReturn(null);

    assertThatThrownBy(() -> documentService.processFileUpload(KB_ID, List.of(file), USER_ID))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessage("Can't find this dataset!");

    then(fileClient).shouldHaveNoInteractions();
  }

  @Test
  void shouldFailUploadWithoutPermission() {

    MockMultipartFile file =
        new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

    KnowledgebaseDto kb = mock(KnowledgebaseDto.class);

    given(kbClient.getKbById(KB_ID)).willReturn(kb);
    given(tenantClient.checkKbTeamPermission(kb, USER_ID)).willReturn(false);

    assertThatThrownBy(() -> documentService.processFileUpload(KB_ID, List.of(file), USER_ID))
        .isInstanceOf(SecurityException.class)
        .hasMessage("No authorization.");
  }

  @Test
  void shouldReturnErrorWhenStorageUploadFails() {

    MockMultipartFile file =
        new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

    KnowledgebaseDto kb = mock(KnowledgebaseDto.class);
    given(kb.id()).willReturn(KB_ID);
    given(kb.tenantId()).willReturn("tenant-1");
    given(kb.name()).willReturn("my-kb");

    given(kbClient.getKbById(KB_ID)).willReturn(kb);
    given(tenantClient.checkKbTeamPermission(any(), eq(USER_ID))).willReturn(true);
    given(fileClient.initializeKnowledgeBaseFolder(any())).willReturn(fileResponse);
    given(documentRepository.save(any())).willReturn(saved);
    given(fileClient.uploadKnowledgeBaseFile(any(MultipartFile.class), eq(KB_ID), eq("doc-1"))).willReturn(null);

    FileUploadResponse response = documentService.processFileUpload(KB_ID, List.of(file), USER_ID);

    assertThat(response.errors()).contains("test.pdf");

    then(documentRepository).should().delete(saved);
  }

  @Test
  void shouldListDocumentsSuccessfully() {

    DocumentListRequest request = new DocumentListRequest(false, null, null, null, null);

    given(tenantClient.getUserTenants(USER_ID)).willReturn(List.of("tenant-1"));
    given(kbClient.queryKbs(anyMap())).willReturn(List.of(mock(KnowledgebaseDto.class)));

    Document document = new Document();
    document.setId("doc-1");
    document.setKbId(KB_ID);
    document.setName("test.pdf");
    document.setThumbnail("");
    document.setSourceType("local/pdf");

    Page<Document> page = new PageImpl<>(List.of(document));

    given(documentRepository.findAll(any(Specification.class), any(Pageable.class))).willReturn(page);

    PaginatedResponse<DocumentDto> response =
        documentService.listDocuments(KB_ID, "", 0, 0, request, USER_ID, PageRequest.of(0, 10));

    assertThat(response).isNotNull();
    assertThat(response.data()).hasSize(1);

    then(documentRepository).should().findAll(any(Specification.class), any(Pageable.class));
  }

  @Test
  void shouldRejectUnauthorizedListRequest() {

    DocumentListRequest request = new DocumentListRequest(false, null, null, null, null);

    given(tenantClient.getUserTenants(USER_ID)).willReturn(List.of("tenant-1"));
    given(kbClient.queryKbs(anyMap())).willReturn(List.of());

    assertThatThrownBy(
            () ->
                documentService.listDocuments(
                    KB_ID, "", 0, 0, request, USER_ID, PageRequest.of(0, 10)))
        .isInstanceOf(SecurityException.class)
        .hasMessage("Only owner of dataset authorized for this operation.");

    then(documentRepository).shouldHaveNoInteractions();
  }

  @Test
  void shouldRejectInvalidFileTypeFilter() {

    DocumentListRequest request =
        new DocumentListRequest(false, null, List.of("unknown"), null, null);

    given(tenantClient.getUserTenants(USER_ID)).willReturn(List.of("tenant-1"));
    given(kbClient.queryKbs(anyMap())).willReturn(List.of(mock(KnowledgebaseDto.class)));
    given(fileClient.isValidFileType(List.of("unknown"))).willReturn(false);

    assertThatThrownBy(
            () ->
                documentService.listDocuments(
                    KB_ID, "", 0, 0, request, USER_ID, PageRequest.of(0, 10)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Invalid filter conditions");
  }

  @Test
  void shouldRejectInvalidRunStatus() {

    DocumentListRequest request =
        new DocumentListRequest(false, List.of("INVALID_STATUS"), null, null, null);

    given(tenantClient.getUserTenants(USER_ID)).willReturn(List.of("tenant-1"));
    given(kbClient.queryKbs(anyMap())).willReturn(List.of(mock(KnowledgebaseDto.class)));

    assertThatThrownBy(
            () ->
                documentService.listDocuments(
                    KB_ID, "", 0, 0, request, USER_ID, PageRequest.of(0, 10)))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
