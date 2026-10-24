package com.ssasm.repository.society;

import java.util.Optional;
import com.ssasm.entity.society.Society;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for society master data.
 */
public interface SocietyRepository extends BaseRepository<Society, Long> {

  Optional<Society> findFirstByDeletedFalseOrderByIdAsc();

  java.util.List<Society> findByDeletedFalse();

  boolean existsBySocietyNameIgnoreCaseAndDeletedFalse(String societyName);

  boolean existsBySocietyNameIgnoreCaseAndDeletedFalseAndIdNot(String societyName, Long id);

  boolean existsByRegistrationNumberIgnoreCaseAndDeletedFalse(String registrationNumber);

  boolean existsByRegistrationNumberIgnoreCaseAndDeletedFalseAndIdNot(String registrationNumber, Long id);
}
