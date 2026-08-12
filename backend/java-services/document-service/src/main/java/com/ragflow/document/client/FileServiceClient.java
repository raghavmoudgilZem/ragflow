package com.ragflow.document.client;

import com.ragflow.document.dto.request.InitializeKbFolderRequest;
import com.ragflow.document.dto.response.FileDownloadResponse;
import com.ragflow.document.dto.response.FileResponse;
import com.ragflow.document.dto.response.UploadStorageResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
//@FeignClient(name = "file-service", path = "/v1/file")
public class FileServiceClient {

    @GetMapping("/kb/root-folder")
    public FileResponse getKbFolder(@RequestHeader("X-Tenant-Id") String tenantId, String name){
        return FileResponse.builder()
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
    }


    @PostMapping("/folders/kb/initialize")
    public FileResponse initializeKnowledgeBaseFolder(@RequestBody InitializeKbFolderRequest request){
        return FileResponse.builder()
                .id("c384bbd2884011f185c99e03f2d816fe")
                .tenantId("5e869f637a8d11f190c1e2c726cbd5c8")
//                .parentId("47c887b47a9211f1b5d9e2c726cbd5c8")
                .createdBy("5e869f637a8d11f190c1e2c726cbd5c8")
//                .name("Testing file")
//                .type("folder")
//                .size(0L)
//                .location("")
//                .sourceType("knowledgebase")
                .build();
    }

    @PostMapping(value = "/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadStorageResponse uploadKnowledgeBaseFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam("kbId") String kbId,
            @RequestParam("documentId") String documentId){
        return new UploadStorageResponse("Test", "pdf","Test.pdf", 3473, "thumbnail_"+documentId+".png", "naive");
    }

    @DeleteMapping("/docs")
    public String deleteDocs(
            @RequestBody List<String> docIds,
            @RequestHeader("X-User-Id") String userId
    ){
        return "";
    }

    @GetMapping("/{id}")
    public FileResponse getFileById(@PathVariable("id") String id){
        return FileResponse.builder().build();
    }

    /**
     * Downloads raw file bytes from the remote File Service storage implementation.
     */
    @GetMapping(value = "/download")
    public FileDownloadResponse downloadFile(
            @RequestParam("bucket") String bucket,
            @RequestParam("objectName") String objectName
    ){
    byte[] content = "hello".getBytes(StandardCharsets.UTF_8);
    return new FileDownloadResponse(
        new ByteArrayInputStream(content), content.length, MediaType.MULTIPART_FORM_DATA_VALUE, objectName);
    }

    @GetMapping("/type/validate")
    public boolean isValidFileType(@RequestBody List<String> types){
        return true;
    }

}