package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.ToLetListing;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ToLetListingRepository extends BaseRepository<ToLetListing, Long> {

  Page<ToLetListing> findByDeletedFalse(Pageable pageable);
}
