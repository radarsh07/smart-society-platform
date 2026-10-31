package com.ssasm.repository.community;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.MaintenanceBill;
import com.ssasm.repository.BaseRepository;

@Repository
public interface MaintenanceBillRepository extends BaseRepository<MaintenanceBill, Long> {

  Page<MaintenanceBill> findByDeletedFalse(Pageable pageable);

  Page<MaintenanceBill> findByResidentIdAndDeletedFalse(Long residentId, Pageable pageable);

  List<MaintenanceBill> findByResidentIdAndDeletedFalse(Long residentId);
}
