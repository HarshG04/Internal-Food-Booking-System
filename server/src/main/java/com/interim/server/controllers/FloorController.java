package com.interim.server.controllers;



import com.interim.server.models.Floor;
import com.interim.server.services.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    @GetMapping
    public List<Floor> getAllFloors() {
        return floorService.getAllFloors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Floor> getFloorById(@PathVariable Integer id) {
        return floorService.getFloorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public List<Floor> getActiveFloors() {
        return floorService.getActiveFloors();
    }

    @PostMapping
    public ResponseEntity<Floor> createFloor(@RequestBody Floor floor) {
        return ResponseEntity.ok(floorService.createFloor(floor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Floor> updateFloor(@PathVariable Integer id, @RequestBody Floor floor) {
        return ResponseEntity.ok(floorService.updateFloor(id, floor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Integer id) {
        floorService.deleteFloor(id);
        return ResponseEntity.noContent().build();
    }
}
