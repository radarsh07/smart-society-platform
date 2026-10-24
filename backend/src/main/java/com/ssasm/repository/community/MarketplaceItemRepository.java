package com.ssasm.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.MarketplaceItem;
import com.ssasm.repository.BaseRepository;

@Repository
public interface MarketplaceItemRepository extends BaseRepository<MarketplaceItem, Long> {

  Page<MarketplaceItem> findByDeletedFalse(Pageable pageable);
}
