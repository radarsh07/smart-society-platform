package com.ssasm.repository.security;

import java.util.List;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.security.DocumentAccessRequest;
import com.ssasm.repository.BaseRepository;

@Repository
public interface DocumentAccessRequestRepository extends BaseRepository<DocumentAccessRequest, Long> {
  List<DocumentAccessRequest> findByResidentIdAndDeletedFalse(Long residentId);
  List<DocumentAccessRequest> findByRequestedByAndDeletedFalse(String requestedBy);
}
