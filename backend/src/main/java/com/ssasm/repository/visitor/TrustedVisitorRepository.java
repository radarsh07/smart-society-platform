package com.ssasm.repository.visitor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.visitor.TrustedVisitor;
import com.ssasm.repository.BaseRepository;

public interface TrustedVisitorRepository extends BaseRepository<TrustedVisitor, Long> {

  Page<TrustedVisitor> findByDeletedFalse(Pageable pageable);

  Optional<TrustedVisitor> findByResidentIdAndVisitorPhoneAndDeletedFalse(Long residentId, String visitorPhone);
}
