package com.interim.server.services;



import com.interim.server.models.Floor;
import com.interim.server.repositories.FloorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;

    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    public Optional<Floor> getFloorById(Integer id) {
        return floorRepository.findById(id);
    }

    public List<Floor> getActiveFloors() {
        return floorRepository.findByIsActive(true);
    }

    public Floor createFloor(Floor floor) {
        return floorRepository.save(floor);
    }

    public Floor updateFloor(Integer id, Floor updated) {
        return floorRepository.findById(id).map(existing -> {
            existing.setFloorNumber(updated.getFloorNumber());
            existing.setIsActive(updated.getIsActive());
            return floorRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
    }

    public void deleteFloor(Integer id) {
        floorRepository.deleteById(id);
    }
}
