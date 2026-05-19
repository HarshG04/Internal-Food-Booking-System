package com.interim.server.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.interim.server.models.Floor;
import com.interim.server.models.Shop;
import com.interim.server.models.User;
import com.interim.server.repositories.FloorRepository;
import com.interim.server.repositories.ShopRepository;
import com.interim.server.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final FloorRepository floorRepository;

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public Optional<Shop> getShopById(Integer id) {
        return shopRepository.findById(id);
    }

    public List<Shop> getShopsByFloor(Integer floorId) {
        return shopRepository.findByFloorId(floorId);
    }

    public List<Shop> getOpenShops() {
        return shopRepository.findByIsOpen(true);
    }

    public List<Shop> getVegShops() {
        return shopRepository.findByIsVeg(true);
    }

    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }

    public Shop updateShop(Integer id, Shop updated) {
        return shopRepository.findById(id).map(existing -> {
            existing.setFloor(updated.getFloor());
            existing.setName(updated.getName());
            existing.setIsVeg(updated.getIsVeg());
            existing.setIsOpen(updated.getIsOpen());
            existing.setAvgRating(updated.getAvgRating());
            return shopRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Shop not found with id: " + id));
    }

    /** Admin: assign a vendor (User with role VENDOR) to a shop. */
    public Shop assignVendor(Integer shopId, Integer vendorId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("User not found: " + vendorId));

        // Enforce one-to-one: reject if this vendor is already assigned to a different shop
        shopRepository.findByVendor_EmployeeId(vendorId).stream()
                .filter(s -> !s.getId().equals(shopId))
                .findFirst()
                .ifPresent(s -> { throw new RuntimeException("Vendor " + vendorId + " is already assigned to shop " + s.getId()); });

        shop.setVendor(vendor);
        return shopRepository.save(shop);
    }

    /** Admin: move a shop to a different floor. */
    public Shop assignFloor(Integer shopId, Integer floorId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found: " + floorId));
        shop.setFloor(floor);
        return shopRepository.save(shop);
    }

    public void deleteShop(Integer id) {
        shopRepository.deleteById(id);
    }
}

