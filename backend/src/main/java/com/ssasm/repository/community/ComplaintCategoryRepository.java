package com.ssasm.repository.community;

import java.util.Optional;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.ComplaintCategory;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ComplaintCategoryRepository extends BaseRepository<ComplaintCategory, Long> {

  Optional<ComplaintCategory> findByIdAndDeletedFalse(Long id);
}
