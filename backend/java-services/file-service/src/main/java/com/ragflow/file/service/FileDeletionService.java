package com.ragflow.file.service;

import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.repository.FileRepository;
import com.ragflow.file.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileDeletionService {

    private final FileRepository repository;
    private final StorageService storageService;

    public void deleteSingleFile(FileEntity file) {
        try {
            if (file.getLocation() != null && !file.getLocation().isBlank()) {


                storageService.delete(file.getParentId().toString(),

                        file.getLocation());

            }


        } catch (Exception ex) {
            log.error("Failed removing storage object {}", file.getLocation(), ex);
        }



        /*
         *
         * Remove file-document mapping
         *
         * Python:
         *
         * File2DocumentService.get_by_file_id()
         *
         */

//        var mappings = fileDocumentService.getByFileId(file.getId());
//
//
//        for (var mapping : mappings) {
//
//
//            UUID documentId = mapping.getDocumentId();
//
//
//
//            /*
//             * Delete document
//             *
//             * Python:
//             *
//             * DocumentService.remove_document()
//             *
//             */
//
//            UUID tenantId = documentService.getTenantId(documentId);
//
//
//            if (tenantId != null) {
//
//
//                documentService.deleteDocument(documentId, tenantId);
//
//            }
//
//
//        }



        /*
         *
         * Delete mapping
         *
         * Python:
         *
         * delete_by_file_id()
         *
         */

//        fileDocumentService.deleteByFileId(file.getId());



        /*
         *
         * Delete database file record
         *
         * Python:
         *
         * FileService.delete(file)
         *
         */

        repository.delete(file);

    }
}
