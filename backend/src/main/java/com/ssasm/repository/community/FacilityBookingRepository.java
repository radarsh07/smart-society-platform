package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.FacilityBooking;
import com.ssasm.repository.BaseRepository;

@Repository
public interface FacilityBookingRepository extends BaseRepository<FacilityBooking, Long> {

  Page<FacilityBooking> findByDeletedFalse(Pageable pageable);
}
