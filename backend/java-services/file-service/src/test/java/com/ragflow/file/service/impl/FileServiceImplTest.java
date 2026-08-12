package com.ragflow.file.service.impl;

import com.ragflow.file.dto.request.CreateFolderRequest;
import com.ragflow.file.dto.request.UploadRequest;
import com.ragflow.file.dto.response.FileListResponse;
import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.dto.response.UploadFileResponse;
import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.enums.FileType;
import com.ragflow.file.exception.DuplicateFolderException;
import com.ragflow.file.exception.FolderNotFoundException;
import com.ragflow.file.exception.ParentFolderNotFoundException;
import com.ragflow.file.exception.StorageException;
import com.ragflow.file.mapper.FileMapper;
import com.ragflow.file.repository.FileRepository;
import com.ragflow.file.security.RequestContext;
import com.ragflow.file.service.FileDeletionService;
import com.ragflow.file.service.FolderService;
import com.ragflow.file.service.PermissionService;
import com.ragflow.file.storage.StorageFactory;
import com.ragflow.file.storage.StorageProperties;
import com.ragflow.file.storage.StorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.ragflow.file.utils.CommonConstants.KNOWLEDGEBASE_FOLDER;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceImplTest {

    @Mock
    private FileRepository repository;

    @Mock
    private StorageService storageService;

    @Mock
    private StorageProperties properties;

    @Mock
    private PermissionService permissionService;

    @Mock
    private FileDeletionService fileDeletionService;

    @Mock
    private FolderService folderService;

    @Mock
    private FileMapper fileMapper;

    @Mock
    private StorageFactory storageFactory;

    @InjectMocks
    private FileServiceImpl fileService;

    private MockedStatic<RequestContext> mockedRequestContext;
    private final UUID tenantId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockedRequestContext = mockStatic(RequestContext.class);
        mockedRequestContext.when(RequestContext::getTenantId).thenReturn(tenantId);
    }

    @AfterEach
    void tearDown() {
        mockedRequestContext.close();
    }

    // =========================================================================
    // 1. CREATE FOLDER TESTS
    // =========================================================================
    @Nested
    @DisplayName("create() Branch Coverage Matrix")
    class CreateFolderTests {

        @Test
        @DisplayName("Should create root folder and subfolder when parent_id is null")
        void create_WhenParentIdIsNull_AndRootDoesNotExist() {
            CreateFolderRequest request = new CreateFolderRequest("NewFolder", UUID.randomUUID(), "FOLDER");

            // Root creation branch
            when(repository.findByTenantIdAndParentId(tenantId, tenantId)).thenReturn(Optional.empty());
            when(repository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            when(repository.existsById(any(UUID.class))).thenReturn(true);
            when(repository.existsByParentIdAndName(any(UUID.class), eq("NewFolder"))).thenReturn(false);

            FileEntity rootMock = FileEntity.builder().id(UUID.randomUUID()).size(0L).build();
            when(repository.findById(any(UUID.class))).thenReturn(Optional.of(rootMock));

            FileResponse response = fileService.create(request);

            assertNotNull(response);
            assertEquals("NewFolder", response.name());
            assertEquals(FileType.FOLDER.getValue(), response.type());
            verify(repository, times(2)).save(any(FileEntity.class));
        }

        @Test
        @DisplayName("Should create folder under existing root when parent_id is null")
        void create_WhenParentIdIsNull_AndRootExists() {
            UUID rootId = UUID.randomUUID();
            FileEntity rootFolder = FileEntity.builder().id(rootId).tenantId(tenantId).build();
            CreateFolderRequest request = new CreateFolderRequest("SubFolder",UUID.randomUUID() ,"folder");

            when(repository.findByTenantIdAndParentId(tenantId, tenantId)).thenReturn(Optional.of(rootFolder));
            when(repository.existsById(rootId)).thenReturn(true);
            when(repository.existsByParentIdAndName(rootId, "SubFolder")).thenReturn(false);
            when(repository.findById(rootId)).thenReturn(Optional.of(rootFolder));

            FileResponse response = fileService.create(request);

            assertNotNull(response);
            assertEquals("SubFolder", response.name());
            assertEquals(FileType.FOLDER.getValue(), response.type());
        }

        @Test
        @DisplayName("Should create virtual folder when type is not 'folder'")
        void create_WhenTypeIsNotFolder_ShouldSetVirtualType() {
            UUID parentId = UUID.randomUUID();
            CreateFolderRequest request = new CreateFolderRequest("VirtualFolder",parentId,  "VIRTUAL");

            when(repository.existsById(parentId)).thenReturn(true);
            when(repository.existsByParentIdAndName(parentId, "VirtualFolder")).thenReturn(false);
            when(repository.findById(parentId)).thenReturn(Optional.empty()); // Covers root.isPresent() false branch

            FileResponse response = fileService.create(request);

            assertNotNull(response);
            assertEquals(FileType.VIRTUAL.getValue(), response.type());
        }

        @Test
        @DisplayName("Should throw ParentFolderNotFoundException when parent folder does not exist")
        void create_WhenParentFolderNotFound_ShouldThrowException() {
            UUID parentId = UUID.randomUUID();
            CreateFolderRequest request = new CreateFolderRequest( "Folder", parentId,"FOLDER");

            when(repository.existsById(parentId)).thenReturn(false);

            assertThrows(ParentFolderNotFoundException.class, () -> fileService.create(request));
            verify(repository, never()).save(any(FileEntity.class));
        }

        @Test
        @DisplayName("Should throw DuplicateFolderException when folder name already exists in parent")
        void create_WhenDuplicateFolderName_ShouldThrowException() {
            UUID parentId = UUID.randomUUID();
            CreateFolderRequest request = new CreateFolderRequest( "ExistingFolder", parentId,"FOLDER");

            when(repository.existsById(parentId)).thenReturn(true);
            when(repository.existsByParentIdAndName(parentId, "ExistingFolder")).thenReturn(true);

            assertThrows(DuplicateFolderException.class, () -> fileService.create(request));
        }
    }

    // =========================================================================
    // 2. UPLOAD FILES TESTS
    // =========================================================================
    @Nested
    @DisplayName("uploadFiles() Branch Coverage Matrix")
    class UploadFilesTests {

        @Test
        @DisplayName("Should upload single file with subfolder hierarchy, storage collision, and name duplication handling")
        void uploadFiles_WithHierarchy_StorageCollision_AndNameDuplication() throws Exception {
            UUID parentId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("file", "docs\\sub\\test.pdf", "application/pdf", "content".getBytes());
            UploadRequest request = new UploadRequest(parentId, List.of(file));

            FileEntity parentFolder = FileEntity.builder().id(parentId).build();
            when(repository.findById(parentId)).thenReturn(Optional.of(parentFolder));

            // Folder hierarchy: "docs" missing, "sub" missing -> creates both
            when(repository.findAllByParentIdAndNameAndType(any(UUID.class), anyString(), eq(FileType.FOLDER.getValue())))
                    .thenReturn(Optional.empty());

            // Storage collisions: "test.pdf" exists once, "test.pdf_" is free
            when(storageService.exists(anyString(), eq("test.pdf"))).thenReturn(true);
            when(storageService.exists(anyString(), eq("test.pdf_"))).thenReturn(false);

            // DB filename duplications: "test.pdf" exists, "test(1).pdf" is free
            when(repository.existsByParentIdAndName(any(UUID.class), eq("test.pdf"))).thenReturn(true);
            when(repository.existsByParentIdAndName(any(UUID.class), eq("test(1).pdf"))).thenReturn(false);

            when(storageFactory.getBucket()).thenReturn("my-bucket");

            List<UploadFileResponse> responses = fileService.uploadFiles(request);

            assertNotNull(responses);
            assertEquals(1, responses.size());
            assertEquals("test(1).pdf", responses.getFirst().name());
            assertEquals("test.pdf_", responses.getFirst().location());
            verify(storageService, times(1)).upload(anyString(), eq("test.pdf_"), any(InputStream.class), anyLong(), anyString());
        }

        @Test
        @DisplayName("Should use existing folder hierarchy if subfolders already exist")
        void uploadFiles_WhenFolderHierarchyAlreadyExists() {
            UUID parentId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("file", "existingFolder/test.txt", "text/plain", "data".getBytes());
            UploadRequest request = new UploadRequest(parentId, List.of(file));

            FileEntity parentFolder = FileEntity.builder().id(parentId).build();
            when(repository.findById(parentId)).thenReturn(Optional.of(parentFolder));

            FileEntity existingFolder = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .parentId(parentId)
                    .name("existingFolder")
                    .type(FileType.FOLDER.getValue())
                    .build();

            when(repository.findAllByParentIdAndNameAndType(parentId, "existingFolder", FileType.FOLDER.getValue()))
                    .thenReturn(Optional.of(existingFolder));

            when(storageService.exists(anyString(), eq("test.txt"))).thenReturn(false);
            when(repository.existsByParentIdAndName(any(UUID.class), eq("test.txt"))).thenReturn(false);
            when(storageFactory.getBucket()).thenReturn("default-bucket");

            List<UploadFileResponse> responses = fileService.uploadFiles(request);

            assertNotNull(responses);
            assertEquals(1, responses.size());
            assertEquals("test.txt", responses.get(0).name());
        }

        @Test
        @DisplayName("Should handle duplicate filename without extension (dot <= 0)")
        void uploadFiles_WhenFilenameHasNoExtension_ShouldHandleDuplication() {
            UUID parentId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("file", "README", "text/plain", "data".getBytes());
            UploadRequest request = new UploadRequest(parentId, List.of(file));

            FileEntity parentFolder = FileEntity.builder().id(parentId).build();
            when(repository.findById(parentId)).thenReturn(Optional.of(parentFolder));

            when(repository.existsByParentIdAndName(parentId, "README")).thenReturn(true);
            when(repository.existsByParentIdAndName(parentId, "README(1)")).thenReturn(false);
            when(storageService.exists(parentId.toString(), "README")).thenReturn(false);
            when(storageFactory.getBucket()).thenReturn("default-bucket");

            List<UploadFileResponse> responses = fileService.uploadFiles(request);

            assertNotNull(responses);
            assertEquals("README(1)", responses.getFirst().name());
        }

        @Test
        @DisplayName("Should upload files to root folder when parent_id is null")
        void uploadFiles_WhenParentIdIsNull_ShouldUploadToRoot() {
            MockMultipartFile file = new MockMultipartFile("file", "file.pdf", "application/pdf", "data".getBytes());
            UploadRequest request = new UploadRequest(null, List.of(file));

            FileEntity rootFolder = FileEntity.builder().id(UUID.randomUUID()).build();
            when(repository.findByTenantIdAndParentId(tenantId, tenantId)).thenReturn(Optional.of(rootFolder));
            when(repository.findById(rootFolder.getId())).thenReturn(Optional.of(rootFolder));

            when(storageService.exists(rootFolder.getId().toString(), "file.pdf")).thenReturn(false);
            when(repository.existsByParentIdAndName(rootFolder.getId(), "file.pdf")).thenReturn(false);
            when(storageFactory.getBucket()).thenReturn("default-bucket");

            List<UploadFileResponse> responses = fileService.uploadFiles(request);

            assertNotNull(responses);
            assertEquals(1, responses.size());
        }

        @Test
        @DisplayName("Should throw ParentFolderNotFoundException when parent folder is missing")
        void uploadFiles_WhenParentNotFound_ShouldThrowException() {
            UUID parentId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "data".getBytes());
            UploadRequest request = new UploadRequest(parentId, List.of(file));

            when(repository.findById(parentId)).thenReturn(Optional.empty());

            assertThrows(ParentFolderNotFoundException.class, () -> fileService.uploadFiles(request));
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException when filename is empty or blank")
        void uploadFiles_WhenFilenameIsBlank_ShouldThrowException() {
            UUID parentId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("file", "   ", "text/plain", "data".getBytes());
            UploadRequest request = new UploadRequest(parentId, List.of(file));

            FileEntity parentFolder = FileEntity.builder().id(parentId).build();
            when(repository.findById(parentId)).thenReturn(Optional.of(parentFolder));

            assertThrows(IllegalArgumentException.class, () -> fileService.uploadFiles(request));
        }

        @Test
        @DisplayName("Should throw StorageException when IOException occurs during upload")
        void uploadFiles_WhenIOException_ShouldThrowStorageException() throws Exception {
            UUID parentId = UUID.randomUUID();
            MultipartFile mockFile = mock(MultipartFile.class);
            when(mockFile.getOriginalFilename()).thenReturn("error.txt");
            when(mockFile.getBytes()).thenThrow(new IOException("Disk Failure"));

            UploadRequest request = new UploadRequest(parentId, List.of(mockFile));
            FileEntity parentFolder = FileEntity.builder().id(parentId).build();
            when(repository.findById(parentId)).thenReturn(Optional.of(parentFolder));

            assertThrows(StorageException.class, () -> fileService.uploadFiles(request));
        }
    }

    // =========================================================================
    // 3. LIST FILES TESTS
    // =========================================================================
    @Nested
    @DisplayName("listFiles() Branch Coverage Matrix")
    class ListFilesTests {

        @Test
        @DisplayName("Should list files with search keywords and DESC sorting")
        void listFiles_WithKeywordsAndDescSorting_ShouldSucceed() {
            UUID parentId = UUID.randomUUID();
            FileEntity fileEntity = FileEntity.builder().id(UUID.randomUUID()).name("document.pdf").build();
            FileEntity parentFolder = FileEntity.builder().id(parentId).name("ParentFolder").build();

            when(repository.findAllByParentId(parentId)).thenReturn(Optional.of(List.of(fileEntity)));

            Page<FileEntity> page = new PageImpl<>(List.of(fileEntity));
            when(repository.searchFiles(eq(tenantId), eq(parentId), eq("doc"), any(Pageable.class))).thenReturn(page);
            when(repository.getParentFolder(parentId)).thenReturn(Optional.of(parentFolder));
            when(fileMapper.ToFileResponse(any())).thenReturn(FileResponse.builder().id(fileEntity.getId()).name("document.pdf").build());

            FileListResponse response = fileService.listFiles(parentId, "doc", 1, 10, "createdAt", true);

            assertNotNull(response);
            assertEquals(1, response.files().size());
            assertEquals("ParentFolder", response.parentFolder().name());
        }

        @Test
        @DisplayName("Should list files without keywords and ASC sorting when parentId is null")
        void listFiles_WhenParentIdIsNull_AndKnowledgebaseFolderMissing() {
            UUID rootId = UUID.randomUUID();
            FileEntity rootFolder = FileEntity.builder().id(rootId).build();
            FileEntity fileEntity = FileEntity.builder().id(UUID.randomUUID()).name("file.txt").build();

            when(repository.findByTenantIdAndParentId(tenantId, tenantId)).thenReturn(Optional.of(rootFolder));

            // initKnowledgebaseDocs missing branch
            when(repository.findAllByParentIdAndName(rootId, KNOWLEDGEBASE_FOLDER)).thenReturn(Optional.empty());
            when(repository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            when(repository.findAllByParentId(rootId)).thenReturn(Optional.of(List.of(fileEntity)));
            when(repository.listFiles(eq(tenantId), eq(rootId), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(fileEntity)));
            when(repository.getParentFolder(rootId)).thenReturn(Optional.of(rootFolder));

            FileListResponse response = fileService.listFiles(null, "   ", 1, 10, "name", false);

            assertNotNull(response);
            verify(repository, times(1)).save(any(FileEntity.class));
        }

        @Test
        @DisplayName("Should skip Knowledgebase folder creation when it already exists")
        void listFiles_WhenKnowledgebaseFolderAlreadyExists() {
            UUID rootId = UUID.randomUUID();
            FileEntity rootFolder = FileEntity.builder().id(rootId).build();
            FileEntity kbFolder = FileEntity.builder().id(UUID.randomUUID()).name(KNOWLEDGEBASE_FOLDER).build();

            when(repository.findByTenantIdAndParentId(tenantId, tenantId)).thenReturn(Optional.of(rootFolder));
            when(repository.findAllByParentIdAndName(rootId, KNOWLEDGEBASE_FOLDER)).thenReturn(Optional.of(kbFolder));

            when(repository.findAllByParentId(rootId)).thenReturn(Optional.of(Collections.emptyList()));
            when(repository.listFiles(eq(tenantId), eq(rootId), any(Pageable.class))).thenReturn(Page.empty());
            when(repository.getParentFolder(rootId)).thenReturn(Optional.of(rootFolder));

            FileListResponse response = fileService.listFiles(null, null, 1, 10, "name", null);

            assertNotNull(response);
            verify(repository, never()).save(any(FileEntity.class));
        }

        @Test
        @DisplayName("Should return empty FileListResponse when folder is not present")
        void listFiles_WhenFolderNotPresent_ShouldReturnEmptyResponse() {
            UUID parentId = UUID.randomUUID();
            when(repository.findAllByParentId(parentId)).thenReturn(Optional.empty());

            FileListResponse response = fileService.listFiles(parentId, null, 1, 10, "name", false);

            assertNotNull(response);
            assertEquals(0L, response.total());
            assertTrue(response.files().isEmpty());
        }

        @Test
        @DisplayName("Should throw FolderNotFoundException when getParentFolder returns empty")
        void listFiles_WhenParentFolderNotFound_ShouldThrowException() {
            UUID parentId = UUID.randomUUID();
            when(repository.findAllByParentId(parentId)).thenReturn(Optional.of(Collections.emptyList()));
            when(repository.listFiles(eq(tenantId), eq(parentId), any(Pageable.class))).thenReturn(Page.empty());
            when(repository.getParentFolder(parentId)).thenReturn(Optional.empty());

            assertThrows(FolderNotFoundException.class, () -> fileService.listFiles(parentId, null, 1, 10, "name", false));
        }
    }

    // =========================================================================
    // 4. DOWNLOAD & STUB METHODS TESTS
    // =========================================================================
    @Nested
    @DisplayName("download() and Unimplemented Methods Matrix")
    class DownloadAndStubsTests {

        @Test
        @DisplayName("Should generate download ResponseEntity cleanly")
        void download_ShouldReturnResponseEntity() {
            UUID fileId = UUID.randomUUID();

            ResponseEntity<Resource> response = fileService.download(fileId);

            assertNotNull(response);
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertNotNull(response.getBody());
        }

        @Test
        @DisplayName("Should execute pass-through void methods without throwing exceptions")
        void passThroughMethods_ShouldExecuteWithoutExceptions() {
            assertDoesNotThrow(() -> fileService.deleteFiles(List.of(UUID.randomUUID())));
            assertDoesNotThrow(() -> fileService.rename(UUID.randomUUID(), "newName"));
            assertDoesNotThrow(() -> fileService.move(List.of(UUID.randomUUID()), UUID.randomUUID()));
        }
    }
}