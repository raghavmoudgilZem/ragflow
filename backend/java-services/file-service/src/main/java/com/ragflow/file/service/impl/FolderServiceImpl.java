package com.ragflow.file.service.impl;

import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.enums.FileType;
import com.ragflow.file.exception.InvalidArgumentException;
import com.ragflow.file.exception.ParentFolderNotFoundException;
import com.ragflow.file.repository.FileRepository;
import com.ragflow.file.service.FolderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FolderServiceImpl implements FolderService {

    private final FileRepository repository;

    @Override
    public FileEntity findFolder(UUID folderId) {
        if (folderId == null) {
            throw new InvalidArgumentException("Folder ID cannot be null");
        }

        return repository.findById(folderId).orElseThrow(() -> new ParentFolderNotFoundException("Folder not found with ID: " + folderId));
    }

    @Override
    public FileEntity getOrCreateRootFolder(UUID tenantId) {
        if (tenantId == null) {
            throw new InvalidArgumentException("Tenant ID cannot be null");
        }

        return repository.findByTenantIdAndParentId(tenantId, tenantId).orElseGet(() -> {
            UUID id = UUID.randomUUID();
            FileEntity root = FileEntity.builder().id(id).parentId(id).tenantId(tenantId).createdBy(tenantId).name("/").type(FileType.FOLDER.getValue()).size(0L).location("").createdAt(Instant.now()).updatedAt(Instant.now()).hasChildFolder(true).build();

            log.info("Created root folder [{}] for tenant [{}]", id, tenantId);
            return repository.save(root);
        });
    }

    @Override
    public FileEntity createFolderHierarchy(UUID parentId, String[] folders, UUID tenantId) {
        if (parentId == null) {
            throw new InvalidArgumentException("Parent ID cannot be null");
        }

        if (folders == null || folders.length == 0) {
            return findFolder(parentId);
        }

        FileEntity current = findFolder(parentId);

        for (String folder : folders) {
            if (folder == null || folder.isBlank()) {
                continue;
            }

            FileEntity finalCurrent = current;
            current = repository.findAllByParentIdAndNameAndType(finalCurrent.getId(), folder, FileType.FOLDER.getValue()).stream().filter(f -> f.getParentId().equals(finalCurrent.getId()) && folder.equals(f.getName())).findFirst().orElseGet(() -> {
                FileEntity newFolder = FileEntity.builder().id(UUID.randomUUID()).parentId(finalCurrent.getId()).tenantId(tenantId).createdBy(tenantId).name(folder).type(FileType.FOLDER.getValue()).location("").size(0L).createdAt(Instant.now()).updatedAt(Instant.now()).hasChildFolder(false).build();

                log.info("Created nested folder [{}] under parent [{}]", folder, finalCurrent.getId());
                return repository.save(newFolder);
            });
        }

        return current;
    }

    @Override
    @Transactional
    public void deleteFolderRecursively(FileEntity folder, UUID userId) {
        if (folder == null) {
            return;
        }

        Optional<List<FileEntity>> children = repository.findAllByParentId(folder.getId());

        if (children.isPresent()) {

            for (FileEntity child : children.get()) {
                if (child.getId().equals(folder.getId())) {
                    continue; // Ignore root self-reference
                }

                if (FileType.FOLDER.getValue().equalsIgnoreCase(child.getType())) {
                    deleteFolderRecursively(child, userId);
                } else {
                    repository.delete(child);
                }
            }
        }

        repository.delete(folder);
        log.info("Deleted folder [{}] and its contents for user [{}]", folder.getId(), userId);
    }
}