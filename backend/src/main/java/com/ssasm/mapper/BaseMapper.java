package com.ssasm.mapper;

/**
 * Generic contract for entity-to-DTO mapping.
 *
 * Manual mapping is preferred at this stage because the domain entities are not
 * implemented yet and compile-time safety can be introduced when concrete types exist.
 */
public interface BaseMapper<E, D> {

  D toDto(E entity);

  E toEntity(D dto);
}
