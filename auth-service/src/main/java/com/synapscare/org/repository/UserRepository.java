package com.synapscare.org.repository;

import com.synapscare.org.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    Optional<User> findByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByUsername(String username);

    List<User> findByRole(User.Role role);

        List<User> findByRoleAndIsDeletedFalse(User.Role role);

    List<User> findByRoleAndIsVerified(User.Role role, Boolean isVerified);

        List<User> findByRoleAndIsVerifiedAndIsDeletedFalse(User.Role role, Boolean isVerified);

    List<User> findByRoleAndIsVerifiedAndIsActive(User.Role role, Boolean isVerified, Boolean isActive);

        List<User> findByRoleAndIsVerifiedAndIsActiveAndIsDeletedFalse(User.Role role, Boolean isVerified, Boolean isActive);

    // New methods for querying without isVerified (using verificationStatus instead)
    List<User> findByRoleAndIsActiveAndIsDeletedFalse(User.Role role, Boolean isActive);

    Optional<User> findByIdAndRoleAndIsActiveAndIsDeletedFalse(Long id, User.Role role, Boolean isActive);

    Optional<User> findByIdAndRoleAndIsVerifiedAndIsActive(
            Long id,
            User.Role role,
            Boolean isVerified,
            Boolean isActive);

        Optional<User> findByIdAndIsDeletedFalse(Long id);

        Optional<User> findByIdAndRoleNotAndIsDeletedFalse(Long id, User.Role role);

        List<User> findByRoleNotAndIsDeletedFalse(User.Role role);

        List<User> findByRoleNotAndRoleAndIsDeletedFalse(User.Role excludedRole, User.Role role);

        Optional<User> findByIdAndRoleAndIsVerifiedAndIsActiveAndIsDeletedFalse(
            Long id,
            User.Role role,
            Boolean isVerified,
            Boolean isActive);

    Optional<User> findByResetToken(String token);
}
