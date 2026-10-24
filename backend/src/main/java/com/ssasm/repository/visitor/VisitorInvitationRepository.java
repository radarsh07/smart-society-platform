package com.ssasm.repository.visitor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.visitor.VisitorInvitation;
import com.ssasm.repository.BaseRepository;

public interface VisitorInvitationRepository extends BaseRepository<VisitorInvitation, Long> {

  Page<VisitorInvitation> findByDeletedFalse(Pageable pageable);

  Optional<VisitorInvitation> findByQrCodeTokenAndDeletedFalse(String qrCodeToken);

  boolean existsByQrCodeTokenAndDeletedFalse(String qrCodeToken);
}
