package com.ssasm.repository.community;

import java.util.Optional;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.ParkingSlot;
import com.ssasm.repository.BaseRepository;

@Repository
public interface ParkingSlotRepository extends BaseRepository<ParkingSlot, Long> {

  Optional<ParkingSlot> findFirstByDeletedFalseAndOccupiedFalseOrderByIdAsc();
}
