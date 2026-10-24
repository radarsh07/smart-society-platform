package com.ssasm.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import com.ssasm.response.PageResponse;

/**
 * Converts Spring Data pages into the project's response wrapper.
 */
public final class PageResponseUtil {

  private PageResponseUtil() {
    throw new UnsupportedOperationException("Utility class");
  }

  public static <T> PageResponse<T> fromPage(Page<T> page, String sortBy, String sortDirection) {
    return PageResponse.<T>builder()
        .content(page.getContent())
        .pageNumber(page.getNumber())
        .pageSize(page.getSize())
        .totalElements(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .first(page.isFirst())
        .last(page.isLast())
        .sortBy(sortBy)
        .sortDirection(sortDirection)
        .build();
  }

  public static Sort sort(String sortBy, String sortDirection) {
    return "ASC".equalsIgnoreCase(sortDirection)
        ? Sort.by(Sort.Direction.ASC, sortBy)
        : Sort.by(Sort.Direction.DESC, sortBy);
  }
}
