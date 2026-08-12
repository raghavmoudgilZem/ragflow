package com.ragflow.document.client;

import com.ragflow.document.dto.KnowledgebaseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
//@FeignClient(name = "user-service", path = "/v1/users")
public class UserTenantServiceClient {

    @GetMapping("/user-tenants")
    public List<String> getUserTenants(@RequestParam("user_id") String userId){
        return List.of("5e869f637a8d11f190c1e2c726cbd5c8");
    }

    /**
     * Verifies if a user has permission to access or modify a specific Knowledge Base.
     */
    @GetMapping("/permission")
    public boolean checkKbTeamPermission(
            @RequestBody() KnowledgebaseDto kbId,
            @RequestHeader("X-User-Id") String userId
    ){
        return true;
    }

    public List<String> accessible4deletion(String docId, String userId) {
        return List.of("3d5795117a9211f1b0a0e2c726cbd5c8");
    }
}