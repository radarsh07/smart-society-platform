package com.ssasm.repository.society;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.society.Building;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for building master data.
 */
public interface BuildingRepository extends BaseRepository<Building, Long> {

  boolean existsBySocietyIdAndBuildingCodeIgnoreCaseAndDeletedFalse(Long societyId, String buildingCode);

  boolean existsBySocietyIdAndBuildingCodeIgnoreCaseAndDeletedFalseAndIdNot(Long societyId, String buildingCode, Long id);

  Page<Building> findBySocietyIdAndDeletedFalse(Long societyId, Pageable pageable);

  java.util.List<Building> findBySocietyIdAndDeletedFalse(Long societyId);

  long countBySocietyIdAndDeletedFalse(Long societyId);
}
