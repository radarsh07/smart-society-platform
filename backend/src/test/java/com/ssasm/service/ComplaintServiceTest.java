package com.ssasm.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.community.ComplaintRequest;
import com.ssasm.dto.community.ComplaintResponse;
import com.ssasm.entity.community.Complaint;
import com.ssasm.entity.community.ComplaintCategory;
import com.ssasm.entity.society.Resident;
import com.ssasm.enums.ComplaintPriority;
import com.ssasm.enums.ComplaintStatus;
import com.ssasm.mapper.community.CommunityMapper;
import com.ssasm.repository.community.ComplaintCategoryRepository;
import com.ssasm.repository.community.ComplaintRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.service.impl.CommunityServiceImpl;

@ExtendWith(MockitoExtension.class)
public class ComplaintServiceTest {

  @Mock
  private ComplaintRepository complaintRepository;
  @Mock
  private ComplaintCategoryRepository complaintCategoryRepository;
  @Mock
  private ResidentRepository residentRepository;
  @Mock
  private CommunityMapper communityMapper;
  @Mock
  private DomainAuditService domainAuditService;

  @InjectMocks
  private CommunityServiceImpl communityService;

  @Test
  public void testCreateComplaint_Success() {
    ComplaintRequest req = new ComplaintRequest();
    req.setResidentId(1L);
    req.setCategoryId(1L);
    req.setSubject("Elevator Noise");
    req.setDescription("Loud vibration sound");
    req.setPriority(ComplaintPriority.HIGH);

    Resident resident = new Resident();
    resident.setId(1L);
    resident.setFullName("John Doe");

    ComplaintCategory category = new ComplaintCategory();
    category.setId(1L);
    category.setName("Elevator");

    Complaint saved = new Complaint();
    saved.setId(10L);
    saved.setTicketNumber("CMP-TEST1234");
    saved.setSubject("Elevator Noise");
    saved.setPriority(ComplaintPriority.HIGH);
    saved.setStatus(ComplaintStatus.OPEN);

    ComplaintResponse response = ComplaintResponse.builder()
        .id(10L)
        .ticketNumber("CMP-TEST1234")
        .subject("Elevator Noise")
        .priority(ComplaintPriority.HIGH)
        .status(ComplaintStatus.OPEN)
        .build();

    when(residentRepository.findById(1L)).thenReturn(Optional.of(resident));
    when(complaintCategoryRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(category));
    when(complaintRepository.save(any(Complaint.class))).thenReturn(saved);
    when(communityMapper.toComplaintResponse(saved)).thenReturn(response);

    ComplaintResponse result = communityService.createComplaint(req, "admin", "127.0.0.1");
    assertNotNull(result);
    assertNotNull(result.getTicketNumber());
  }
}
