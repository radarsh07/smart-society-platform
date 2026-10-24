package com.ssasm.repository.society;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.society.Resident;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for resident profiles.
 */
public interface ResidentRepository extends BaseRepository<Resident, Long> {

  boolean existsByEmailIgnoreCaseAndDeletedFalse(String email);

  boolean existsByEmailIgnoreCaseAndDeletedFalseAndIdNot(String email, Long id);

  boolean existsByPhoneNumberAndDeletedFalse(String phoneNumber);

  boolean existsByPhoneNumberAndDeletedFalseAndIdNot(String phoneNumber, Long id);

  Optional<Resident> findByUserUsernameIgnoreCaseAndDeletedFalse(String username);

  Optional<Resident> findByUserIdAndDeletedFalse(Long userId);

  Page<Resident> findByDeletedFalse(Pageable pageable);

  java.util.List<Resident> findByDeletedFalse();

  java.util.List<Resident> findByResidentStatusAndDeletedFalse(String residentStatus);

  long countByDeletedFalse();
}
