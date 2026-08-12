package com.ragflow.llmgateway.service.impl;

import com.ragflow.llmgateway.constants.CacheNames;
import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.entity.LlmFactory;
import com.ragflow.llmgateway.exception.ResourceNotFoundException;
import com.ragflow.llmgateway.mapper.FactoryMapper;
import com.ragflow.llmgateway.repository.LlmFactoryRepository;
import com.ragflow.llmgateway.service.FactoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FactoryServiceImpl implements FactoryService {

    private final LlmFactoryRepository llmFactoryRepository;
    private final FactoryMapper factoryMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheNames.FACTORIES, key = "#activeOnly + ':' + (#tag != null ? #tag.toLowerCase() : '*')")
    public List<FactoryResponse> getFactories(boolean activeOnly, String tag) {
        List<LlmFactory> factories = activeOnly
                ? llmFactoryRepository.findByActiveTrueOrderByRankDesc()
                : llmFactoryRepository.findAllByOrderByRankDesc();

        log.debug("Fetched {} factories (activeOnly={}, tag={})", factories.size(), activeOnly, tag);

        // Collected into a plain ArrayList rather than .toList() — the latter returns a JDK-internal
        // immutable list type that GenericJackson2JsonRedisSerializer's default typing cannot
        // round-trip correctly through the Redis cache (fails on deserialize with a type-id error).
        return factories.stream()
                .filter(factory -> matchesTag(factory, tag))
                .map(factoryMapper::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheNames.FACTORY, key = "#name")
    public FactoryResponse getFactoryByName(String name) {
        LlmFactory factory = llmFactoryRepository.findById(name)
                .orElseThrow(() -> new ResourceNotFoundException("LLM factory '%s' not found".formatted(name)));
        return factoryMapper.toResponse(factory);
    }

    private boolean matchesTag(LlmFactory factory, String tag) {
        if (tag == null || tag.isBlank()) {
            return true;
        }
        return factory.getTagList().stream().anyMatch(candidate -> candidate.equalsIgnoreCase(tag));
    }
}
