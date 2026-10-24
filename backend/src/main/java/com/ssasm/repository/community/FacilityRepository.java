package com.ssasm.repository.community;

import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Facility;
import com.ssasm.repository.BaseRepository;

@Repository
public interface FacilityRepository extends BaseRepository<Facility, Long> {
}
