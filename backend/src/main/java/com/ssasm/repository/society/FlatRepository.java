package com.ssasm.repository.society;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.society.Flat;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for flat master data.
 */
public interface FlatRepository extends BaseRepository<Flat, Long> {

  boolean existsByBuildingIdAndFlatNumberIgnoreCaseAndDeletedFalse(Long buildingId, String flatNumber);

  boolean existsByBuildingIdAndFlatNumberIgnoreCaseAndDeletedFalseAndIdNot(Long buildingId, String flatNumber, Long id);

  Page<Flat> findByBuildingIdAndDeletedFalse(Long buildingId, Pageable pageable);

  java.util.List<Flat> findByBuildingIdAndDeletedFalse(Long buildingId);

  long countByBuildingSocietyIdAndDeletedFalse(Long societyId);

  long countByStatus(String status);
}
