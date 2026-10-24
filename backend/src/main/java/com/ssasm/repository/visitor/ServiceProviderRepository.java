package com.ssasm.repository.visitor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ssasm.entity.visitor.ServiceProvider;
import com.ssasm.repository.BaseRepository;

public interface ServiceProviderRepository extends BaseRepository<ServiceProvider, Long> {

  Page<ServiceProvider> findByDeletedFalse(Pageable pageable);

  Optional<ServiceProvider> findBySocietyIdAndContactPhoneAndDeletedFalse(Long societyId, String contactPhone);
}
