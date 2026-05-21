package com.interim.server.repositories;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.interim.server.models.Floor;


@Repository
public interface FloorRepository extends JpaRepository<Floor, Integer> {
    Optional<Floor> findByFloorNumber(String floorNumber);
    List<Floor> findByIsActive(Boolean isActive);
}

