package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Staff;
import com.ssasm.repository.BaseRepository;

@Repository
public interface StaffRepository extends BaseRepository<Staff, Long> {

  Page<Staff> findByDeletedFalse(Pageable pageable);
}
