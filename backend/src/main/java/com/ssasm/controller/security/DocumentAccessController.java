package com.ssasm.controller.security;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.entity.security.DocumentAccessRequest;
import com.ssasm.entity.society.Resident;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.repository.security.DocumentAccessRequestRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.response.ApiResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/document-access")
public class DocumentAccessController {

  private final DocumentAccessRequestRepository requestRepository;
  private final ResidentRepository residentRepository;

  public DocumentAccessController(
      DocumentAccessRequestRepository requestRepository,
      ResidentRepository residentRepository) {
    this.requestRepository = requestRepository;
    this.residentRepository = residentRepository;
  }

  @PostMapping("/request/{residentId}")
  public ResponseEntity<ApiResponse<DocumentAccessRequest>> requestAccess(
      @PathVariable Long residentId,
      @RequestParam String documentType,
      @AuthenticationPrincipal UserPrincipal principal) {
    Resident resident = residentRepository.findById(residentId)
        .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));

    DocumentAccessRequest req = new DocumentAccessRequest();
    req.setResident(resident);
    req.setRequestedBy(principal != null ? principal.getUsername() : "admin");
    req.setDocumentType(documentType);
    req.setStatus("PENDING");
    req.setCreatedBy(principal != null ? principal.getUsername() : "admin");
    req.setUpdatedBy(principal != null ? principal.getUsername() : "admin");

    DocumentAccessRequest saved = requestRepository.save(req);
    return ResponseEntity.ok(ResponseUtil.success("Document access request sent to resident", saved));
  }

  @PutMapping("/{id}/respond")
  public ResponseEntity<ApiResponse<DocumentAccessRequest>> respondToAccessRequest(
      @PathVariable Long id,
      @RequestParam boolean approve) {
    DocumentAccessRequest req = requestRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

    if (approve) {
      req.setStatus("APPROVED");
      req.setTemporaryToken("DOC_TEMP_TOKEN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      req.setExpiresAt(LocalDateTime.now().plusHours(24));
    } else {
      req.setStatus("REJECTED");
    }

    DocumentAccessRequest saved = requestRepository.save(req);
    return ResponseEntity.ok(ResponseUtil.success("Response recorded", saved));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<DocumentAccessRequest>>> listRequests(@AuthenticationPrincipal UserPrincipal principal) {
    String username = principal != null ? principal.getUsername() : "admin";
    return ResponseEntity.ok(ResponseUtil.success("Document access requests fetched", requestRepository.findByRequestedByAndDeletedFalse(username)));
  }
}
