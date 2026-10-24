package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Parcel;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ParcelRepository extends BaseRepository<Parcel, Long> {

  Page<Parcel> findByDeletedFalse(Pageable pageable);
}
