package com.ragflow.search.repository;

import com.ragflow.search.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Python JOIN condition:
     * User.id == search.tenant_id AND User.status == StatusEnum.VALID.value
     */
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.status = 1")
    Optional<User> findByIdAndStatusValid(@Param("id") String id);

    /**
     * Batch fetch for list endpoint — avoids N+1 queries
     */
    @Query("SELECT u FROM User u WHERE u.id IN :ids AND u.status = 1")
    List<User> findAllByIdInAndStatusValid(@Param("ids") List<String> ids);
}