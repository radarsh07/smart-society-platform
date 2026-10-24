package com.ssasm.service.society;

import com.ssasm.dto.society.SocietyRequest;
import com.ssasm.response.society.SocietyResponse;

/**
 * Society management operations.
 */
public interface SocietyService {

  SocietyResponse createSociety(SocietyRequest request, String username, String ipAddress);

  SocietyResponse updateSociety(Long societyId, SocietyRequest request, String username, String ipAddress);

  SocietyResponse getSociety(Long societyId);

  SocietyResponse getCurrentSociety();
}
