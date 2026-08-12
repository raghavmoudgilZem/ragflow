package com.rag.identity_service.util;

import com.rag.identity_service.enumUtil.TenantRole;
import com.rag.identity_service.model.RoleEntity;
import com.rag.identity_service.repo.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RoleSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;

    public RoleSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Verifying lookup role dependencies configuration rows inside system tables");
        for (TenantRole role : TenantRole.values()) {
            roleRepository.findByRoleName(role.name())
                    .orElseGet(() -> {
                        log.info("Seeding data dictionary layer schema with native enum context: {}", role.name());
                        return roleRepository.save(new RoleEntity(role.name()));
                    });
        }
    }
}