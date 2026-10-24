package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.ServiceBooking;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ServiceBookingRepository extends BaseRepository<ServiceBooking, Long> {

  Page<ServiceBooking> findByDeletedFalse(Pageable pageable);
}
