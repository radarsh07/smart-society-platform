package com.ssasm.service.society;

import com.ssasm.dto.society.FlatRequest;
import com.ssasm.dto.society.FlatSearchRequest;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.FlatResponse;

/**
 * Flat management operations.
 */
public interface FlatService {

  FlatResponse createFlat(FlatRequest request, String username, String ipAddress);

  FlatResponse updateFlat(Long flatId, FlatRequest request, String username, String ipAddress);

  void deleteFlat(Long flatId, String username, String ipAddress);

  FlatResponse getFlat(Long flatId);

  PageResponse<FlatResponse> listFlats(FlatSearchRequest request);
}
