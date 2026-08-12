package com.ragflow.file.service;

import com.ragflow.file.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DuplicateNameService {

    private final FileRepository repository;

    public String generateName(
            UUID parentId,
            String filename) {

        if (!repository.existsByParentIdAndName(
                parentId,
                filename)) {

            return filename;

        }

        int count = 1;

        String base = FilenameUtils.getBaseName(filename);

        String ext = FilenameUtils.getExtension(filename);

        while (true) {

            String newName =
                    base + "(" + count + ")." + ext;

            if (!repository.existsByParentIdAndName(
                    parentId,
                    newName)) {

                return newName;

            }

            count++;

        }

    }

}