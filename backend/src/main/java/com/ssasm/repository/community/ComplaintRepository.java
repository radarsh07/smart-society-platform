package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Complaint;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ComplaintRepository extends BaseRepository<Complaint, Long> {

  Page<Complaint> findByDeletedFalse(Pageable pageable);
}
