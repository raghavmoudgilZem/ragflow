package com.ragflow.document.client;

import org.springframework.stereotype.Component;

@Component
public class RagClient {

    public boolean updateChunkStatus(String docId, int status, String tenantId, String kbId) {
        return true;
    }
}
