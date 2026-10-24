package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.ParkingAllocation;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ParkingAllocationRepository extends BaseRepository<ParkingAllocation, Long> {

  Page<ParkingAllocation> findByDeletedFalse(Pageable pageable);
}
