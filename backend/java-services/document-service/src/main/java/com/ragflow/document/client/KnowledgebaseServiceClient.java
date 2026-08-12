package com.ragflow.document.client;

import com.ragflow.document.dto.KnowledgebaseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
//@FeignClient(name = "knowledgebase-service", path = "/v1/kb")
public class KnowledgebaseServiceClient {

    final String TENANT_ID = "5e869f637a8d11f190c1e2c726cbd5c8";
    final String KB_ID = "3d5795117a9211f1b0a0e2c726cbd5c8";
    final String KB_NAME = "Handbook";

    /**
     * Retrieves the details of a Knowledge Base by its ID.
     */
    @GetMapping("/{id}")
    public KnowledgebaseDto getKbById(@PathVariable("id") String id){
        return KnowledgebaseDto.builder().id(id).tenantId(TENANT_ID).name(KB_NAME).parserId("naive").build();
    }

    /**
     * Retrieves a list of Knowledge Base IDs belonging to a specific tenant.
     */
    @GetMapping("/tenants/{tenantId}/id")
    public List<String> getKbByTenantId(@PathVariable("tenantId") String tenantId){
        return List.of(UUID.randomUUID().toString());
    }

    // 2. query(tenant_id=..., id=...)
    // Returns a list of KBs matching the dynamic kwargs parameters
    @GetMapping("/api/kbs")
    public List<KnowledgebaseDto> queryKbs(/*@SpringQueryMap*/ Map<String, Object> kwargs){
        return List.of(KnowledgebaseDto.builder().id(KB_ID).build());
    }

    public List<String> accessibleKb(String kbId, String currentUserId) {
        return List.of(KB_ID);
    }
}
