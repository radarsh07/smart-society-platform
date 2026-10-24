package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Vehicle;
import com.ssasm.repository.BaseRepository;

@Repository
public interface VehicleRepository extends BaseRepository<Vehicle, Long> {

  Page<Vehicle> findByDeletedFalse(Pageable pageable);
}
