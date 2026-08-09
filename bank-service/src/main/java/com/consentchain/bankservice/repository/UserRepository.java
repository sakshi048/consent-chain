package com.consentchain.bankservice.repository;

import com.consentchain.bankservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByInstitutionIdAndUsername(
            String institutionId,
            String username
    );

    boolean existsByUsername(String username);
}
