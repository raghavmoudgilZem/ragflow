package com.ragflow.file.mapper;

import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.repository.FileRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@AllArgsConstructor
public class FileMapper {


    private final FileRepository repository;

    public FileResponse ToFileResponse(
            FileEntity entity) {

        FileResponse response =
                FileResponse.builder()

                        .id(entity.getId())
                        .parentId(entity.getParentId())
                        .tenantId(entity.getTenantId())
                        .createdBy(entity.getCreatedBy())
                        .name(entity.getName())
                        .location(entity.getLocation())
                        .size(entity.getSize())
                        .type(entity.getType())
                        .createdAt(entity.getCreatedAt())
                        .updatedAt(entity.getUpdatedAt())
                        .hasChildFolder(entity.getHasChildFolder())
                        .kbsInfo(entity.getKbsInfo() != null && !entity.getKbsInfo().isEmpty() ? entity.getKbsInfo() : List.of() )
                        .build();

        //--------------------------------------------------
        // Folder
        //--------------------------------------------------

//        if ("folder".equalsIgnoreCase(entity.getType())) {
//
//            response.setSize(
//                    getFolderSize(entity.getId()));
//
//            response.setHasChildFolder(
//                    re.existsByParentIdAndType(
//                            entity.getId(),
//                            "folder"));
//
//            response.setKbsInfo(
//                    Collections.emptyList());
//
//        }
//
//        //--------------------------------------------------
//        // File
//        //--------------------------------------------------
//
//        else {
//
//            response.setKbsInfo(
//                    getKbInfo(entity.getId()));
//
//        }

        return response;

    }
}
