package com.interim.server.controllers;

import com.interim.server.enums.Role;
import com.interim.server.models.Shop;
import com.interim.server.models.User;
import com.interim.server.services.ShopService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping("/my")
    public ResponseEntity<Shop> getMyShop(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser.getRole() != Role.VENDOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return shopService.getShopByVendorId(currentUser.getEmployeeId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @PostMapping("/{id}/image")
    public ResponseEntity<Void> uploadShopImage(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) throws IOException {
        shopService.uploadImage(id, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getShopImage(@PathVariable Integer id) {
        Shop shop = shopService.getShopWithImage(id);
        if (shop.getImage() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(shop.getImageType()))
                .body(shop.getImage());
    }

    @PostMapping
    public ResponseEntity<Shop> createShop(@RequestBody Shop shop) {
        return ResponseEntity.ok(shopService.createShop(shop));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Integer id, @RequestBody Shop shop) {
        return ResponseEntity.ok(shopService.updateShop(id, shop));
    }

    @PostMapping("/{shopId}/vendor/{vendorId}")
    public ResponseEntity<Shop> assignVendor(
            @PathVariable Integer shopId,
            @PathVariable Integer vendorId,
            HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shopService.assignVendor(shopId, vendorId));
    }

    @PutMapping("/{shopId}/vendor/{vendorId}")
    public ResponseEntity<Shop> reassignVendor(
            @PathVariable Integer shopId,
            @PathVariable Integer vendorId,
            HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shopService.reassignVendor(shopId, vendorId));
    }

    @DeleteMapping("/{shopId}/vendor")
    public ResponseEntity<Shop> unassignVendor(
            @PathVariable Integer shopId,
            HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shopService.unassignVendor(shopId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShop(@PathVariable Integer id) {
        shopService.deleteShop(id);
        return ResponseEntity.noContent().build();
    }
}

