package com.ssasm.repository.community;

import java.util.List;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.community.Payment;
import com.ssasm.repository.BaseRepository;

@Repository
public interface PaymentRepository extends BaseRepository<Payment, Long> {
  List<Payment> findByBillIdAndDeletedFalse(Long billId);
  List<Payment> findByResidentIdAndDeletedFalse(Long residentId);
}
