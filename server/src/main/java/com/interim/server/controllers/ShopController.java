package com.interim.server.controllers;

import com.interim.server.models.Shop;
import com.interim.server.services.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public List<Shop> getAllShops() {
        return shopService.getAllShops();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable Integer id) {
        return shopService.getShopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/floor/{floorId}")
    public List<Shop> getShopsByFloor(@PathVariable Integer floorId) {
        return shopService.getShopsByFloor(floorId);
    }

    @GetMapping("/open")
    public List<Shop> getOpenShops() {
        return shopService.getOpenShops();
    }

    @GetMapping("/veg")
    public List<Shop> getVegShops() {
        return shopService.getVegShops();
    }

    @PostMapping
    public ResponseEntity<Shop> createShop(@RequestBody Shop shop) {
        return ResponseEntity.ok(shopService.createShop(shop));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Integer id, @RequestBody Shop shop) {
        return ResponseEntity.ok(shopService.updateShop(id, shop));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShop(@PathVariable Integer id) {
        shopService.deleteShop(id);
        return ResponseEntity.noContent().build();
    }
}

