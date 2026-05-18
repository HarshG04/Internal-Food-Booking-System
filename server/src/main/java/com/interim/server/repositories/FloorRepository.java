package com.interim.server.repositories;


import java.util.List;
import java.util.Optional;

import com.interim.server.models.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface FloorRepository extends JpaRepository<Floor, Integer> {
    Optional<Floor> findByFloorNumber(Integer floorNumber);
    List<Floor> findByIsActive(Boolean isActive);
}

