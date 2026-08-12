package com.ragflow.file.service.impl;

import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.enums.FileType;
import com.ragflow.file.exception.InvalidArgumentException;
import com.ragflow.file.exception.ParentFolderNotFoundException;
import com.ragflow.file.repository.FileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FolderServiceImplTest {

    @Mock
    private FileRepository repository;

    @InjectMocks
    private FolderServiceImpl folderService;

    private UUID tenantId;
    private UUID folderId;
    private FileEntity sampleFolder;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        folderId = UUID.randomUUID();

        sampleFolder = FileEntity.builder()
                .id(folderId)
                .parentId(tenantId)
                .tenantId(tenantId)
                .createdBy(tenantId)
                .name("documents")
                .type(FileType.FOLDER.getValue())
                .size(0L)
                .location("")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .hasChildFolder(false)
                .build();
    }

    // =========================================================================
    // findFolder() Tests
    // =========================================================================

    @Nested
    @DisplayName("findFolder Tests")
    class FindFolderTests {

        @Test
        @DisplayName("Should throw InvalidArgumentException when folderId is null")
        void findFolder_WhenFolderIdIsNull_ShouldThrowInvalidArgumentException() {
            assertThatThrownBy(() -> folderService.findFolder(null))
                    .isInstanceOf(InvalidArgumentException.class)
                    .hasMessage("Folder ID cannot be null");

            verifyNoInteractions(repository);
        }

        @Test
        @DisplayName("Should return FileEntity when folder exists in repository")
        void findFolder_WhenFolderExists_ShouldReturnFileEntity() {
            when(repository.findById(folderId)).thenReturn(Optional.of(sampleFolder));

            FileEntity result = folderService.findFolder(folderId);

            assertThat(result).isNotNull().isEqualTo(sampleFolder);
            verify(repository, times(1)).findById(folderId);
        }

        @Test
        @DisplayName("Should throw ParentFolderNotFoundException when folder does not exist")
        void findFolder_WhenFolderDoesNotExist_ShouldThrowParentFolderNotFoundException() {
            when(repository.findById(folderId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> folderService.findFolder(folderId))
                    .isInstanceOf(ParentFolderNotFoundException.class)
                    .hasMessage("Folder not found with ID: " + folderId);

            verify(repository, times(1)).findById(folderId);
        }
    }

    // =========================================================================
    // getOrCreateRootFolder() Tests
    // =========================================================================

    @Nested
    @DisplayName("getOrCreateRootFolder Tests")
    class GetOrCreateRootFolderTests {

        @Test
        @DisplayName("Should throw InvalidArgumentException when tenantId is null")
        void getOrCreateRootFolder_WhenTenantIdIsNull_ShouldThrowInvalidArgumentException() {
            assertThatThrownBy(() -> folderService.getOrCreateRootFolder(null))
                    .isInstanceOf(InvalidArgumentException.class)
                    .hasMessage("Tenant ID cannot be null");

            verifyNoInteractions(repository);
        }

        @Test
        @DisplayName("Should return existing root folder when found in repository")
        void getOrCreateRootFolder_WhenRootExists_ShouldReturnExistingFolder() {
            FileEntity rootFolder = FileEntity.builder()
                    .id(tenantId)
                    .parentId(tenantId)
                    .tenantId(tenantId)
                    .name("/")
                    .type(FileType.FOLDER.getValue())
                    .build();

            when(repository.findByTenantIdAndParentId(tenantId, tenantId))
                    .thenReturn(Optional.of(rootFolder));

            FileEntity result = folderService.getOrCreateRootFolder(tenantId);

            assertThat(result).isNotNull().isEqualTo(rootFolder);
            verify(repository, times(1)).findByTenantIdAndParentId(tenantId, tenantId);
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Should create and save new root folder when it does not exist")
        void getOrCreateRootFolder_WhenRootDoesNotExist_ShouldCreateAndSaveRootFolder() {
            when(repository.findByTenantIdAndParentId(tenantId, tenantId))
                    .thenReturn(Optional.empty());
            when(repository.save(any(FileEntity.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            FileEntity result = folderService.getOrCreateRootFolder(tenantId);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("/");
            assertThat(result.getType()).isEqualTo(FileType.FOLDER.getValue());
            assertThat(result.getTenantId()).isEqualTo(tenantId);
            assertThat(result.getHasChildFolder()).isTrue();

            verify(repository, times(1)).findByTenantIdAndParentId(tenantId, tenantId);
            verify(repository, times(1)).save(any(FileEntity.class));
        }
    }

    // =========================================================================
    // createFolderHierarchy() Tests
    // =========================================================================

    @Nested
    @DisplayName("createFolderHierarchy Tests")
    class CreateFolderHierarchyTests {

        @Test
        @DisplayName("Should throw InvalidArgumentException when parentId is null")
        void createFolderHierarchy_WhenParentIdIsNull_ShouldThrowInvalidArgumentException() {
            String[] folders = new String[]{"dir1", "dir2"};

            assertThatThrownBy(() -> folderService.createFolderHierarchy(null, folders, tenantId))
                    .isInstanceOf(InvalidArgumentException.class)
                    .hasMessage("Parent ID cannot be null");

            verifyNoInteractions(repository);
        }

        @Test
        @DisplayName("Should return parent folder when folders array is null or empty")
        void createFolderHierarchy_WhenFoldersIsNullOrEmpty_ShouldReturnParentFolder() {
            when(repository.findById(folderId)).thenReturn(Optional.of(sampleFolder));

            FileEntity resultNull = folderService.createFolderHierarchy(folderId, null, tenantId);
            FileEntity resultEmpty = folderService.createFolderHierarchy(folderId, new String[]{}, tenantId);

            assertThat(resultNull).isEqualTo(sampleFolder);
            assertThat(resultEmpty).isEqualTo(sampleFolder);
            verify(repository, times(2)).findById(folderId);
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Should traverse existing folders and create missing nested folders")
        void createFolderHierarchy_WhenSomeFoldersExistAndSomeAreNew_ShouldCreateMissingFolders() {
            String[] folderPath = new String[]{"existingDir", "newDir"};

            FileEntity existingChild = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .parentId(sampleFolder.getId())
                    .tenantId(tenantId)
                    .name("existingDir")
                    .type(FileType.FOLDER.getValue())
                    .build();

            when(repository.findById(folderId)).thenReturn(Optional.of(sampleFolder));

            // Step 1: "existingDir" is found (returns Optional.of)
            when(repository.findAllByParentIdAndNameAndType(sampleFolder.getId(), "existingDir", FileType.FOLDER.getValue()))
                    .thenReturn(Optional.of(existingChild));

            // Step 2: "newDir" is not found under "existingDir" (returns Optional.empty)
            when(repository.findAllByParentIdAndNameAndType(existingChild.getId(), "newDir", FileType.FOLDER.getValue()))
                    .thenReturn(Optional.empty());

            when(repository.save(any(FileEntity.class))).thenAnswer(inv -> inv.getArgument(0));

            FileEntity result = folderService.createFolderHierarchy(folderId, folderPath, tenantId);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("newDir");
            assertThat(result.getParentId()).isEqualTo(existingChild.getId());

            verify(repository, times(1)).save(any(FileEntity.class));
        }

        @Test
        @DisplayName("Should skip blank or null folder names in the hierarchy")
        void createFolderHierarchy_WhenFoldersContainBlankOrNull_ShouldSkipInvalidFolders() {
            String[] folderPath = new String[]{" ", null, "validDir"};

            when(repository.findById(folderId)).thenReturn(Optional.of(sampleFolder));
            when(repository.findAllByParentIdAndNameAndType(sampleFolder.getId(), "validDir", FileType.FOLDER.getValue()))
                    .thenReturn(Optional.empty()); // Fixed: Changed from Collections.emptyList() to Optional.empty()
            when(repository.save(any(FileEntity.class))).thenAnswer(inv -> inv.getArgument(0));

            FileEntity result = folderService.createFolderHierarchy(folderId, folderPath, tenantId);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("validDir");

            verify(repository, times(1)).save(any(FileEntity.class));
        }
    }

    // =========================================================================
    // deleteFolderRecursively() Tests
    // =========================================================================

    @Nested
    @DisplayName("deleteFolderRecursively Tests")
    class DeleteFolderRecursivelyTests {

        @Test
        @DisplayName("Should do nothing when input folder is null")
        void deleteFolderRecursively_WhenFolderIsNull_ShouldDoNothing() {
            folderService.deleteFolderRecursively(null, tenantId);

            verifyNoInteractions(repository);
        }

        @Test
        @DisplayName("Should recursively delete subfolders and normal files before deleting target folder")
        void deleteFolderRecursively_WhenFolderHasChildren_ShouldDeleteRecursively() {
            UUID rootFolderId = sampleFolder.getId();

            FileEntity subFolder = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .parentId(rootFolderId)
                    .name("subFolder")
                    .type(FileType.FOLDER.getValue())
                    .build();

            FileEntity normalFile = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .parentId(rootFolderId)
                    .name("document.pdf")
                    .type("file")
                    .build();

            FileEntity nestedFile = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .parentId(subFolder.getId())
                    .name("nested.txt")
                    .type("file")
                    .build();

            // Root folder children -> [subFolder, normalFile]
            when(repository.findAllByParentId(rootFolderId))
                    .thenReturn(Optional.of(List.of(subFolder, normalFile)));

// subFolder children -> [nestedFile]
            when(repository.findAllByParentId(subFolder.getId()))
                    .thenReturn(Optional.of(List.of(nestedFile)));

            folderService.deleteFolderRecursively(sampleFolder, tenantId);

            // Verify deletion of all entities including nested children
            ArgumentCaptor<FileEntity> captor = ArgumentCaptor.forClass(FileEntity.class);
            verify(repository, times(4)).delete(captor.capture());

            List<FileEntity> deletedEntities = captor.getAllValues();
            assertThat(deletedEntities).containsExactlyInAnyOrder(nestedFile, subFolder, normalFile, sampleFolder);
        }

        @Test
        @DisplayName("Should skip child if child ID equals the parent folder ID (root self-reference)")
        void deleteFolderRecursively_WhenChildIsSelfReferencing_ShouldSkipSelfAndDeleteFolder() {
            UUID selfRefId = sampleFolder.getId();

            FileEntity selfReferencingChild = FileEntity.builder()
                    .id(selfRefId)
                    .parentId(selfRefId)
                    .name("/")
                    .type(FileType.FOLDER.getValue())
                    .build();

            when(repository.findAllByParentId(selfRefId))
                    .thenReturn(Optional.of(List.of(selfReferencingChild)));

            folderService.deleteFolderRecursively(sampleFolder, tenantId);

            verify(repository, times(1)).delete(sampleFolder);
        }
    }
}