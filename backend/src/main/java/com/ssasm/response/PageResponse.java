package com.ssasm.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

/**
 * Generic paginated response wrapper.
 */
@Getter
@Builder
public class PageResponse<T> {

  private List<T> content;
  private int pageNumber;
  private int pageSize;
  private long totalElements;
  private int totalPages;
  private boolean first;
  private boolean last;
  private String sortBy;
  private String sortDirection;
}
