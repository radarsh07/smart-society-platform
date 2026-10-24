package com.ssasm.controller.society;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.dto.society.BuildingRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.BuildingResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.service.society.BuildingService;
import com.ssasm.util.ResponseUtil;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * REST endpoints for building management.
 */
@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

  private final BuildingService buildingService;

  public BuildingController(BuildingService buildingService) {
    this.buildingService = buildingService;
  }

  @PostMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<BuildingResponse>> create(
      @Valid @RequestBody BuildingRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    BuildingResponse response = buildingService.createBuilding(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Building created successfully", response));
  }

  @PutMapping("/{buildingId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<BuildingResponse>> update(
      @PathVariable Long buildingId,
      @Valid @RequestBody BuildingRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    BuildingResponse response = buildingService.updateBuilding(buildingId, request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Building updated successfully", response));
  }

  @DeleteMapping("/{buildingId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> delete(
      @PathVariable Long buildingId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    buildingService.deleteBuilding(buildingId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Building deleted successfully", "Deleted"));
  }

  @GetMapping("/{buildingId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<BuildingResponse>> get(@PathVariable Long buildingId) {
    return ResponseEntity.ok(ResponseUtil.success("Building fetched successfully", buildingService.getBuilding(buildingId)));
  }

  @GetMapping
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<BuildingResponse>>> list(
      @RequestParam Long societyId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success(
        "Buildings fetched successfully",
        buildingService.listBuildings(societyId, page, size, sortBy, sortDirection)));
  }
}
