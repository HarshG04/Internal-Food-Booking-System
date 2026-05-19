package com.interim.server.services;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    public Optional<Shop> getShopByVendorId(Integer vendorId) {
        return shopRepository.findByVendor_EmployeeId(vendorId).stream().findFirst();
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

    public Shop uploadImage(Integer shopId, MultipartFile file) throws IOException {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        shop.setImage(file.getBytes());
        shop.setImageType(file.getContentType());
        return shopRepository.save(shop);
    }

    public Shop getShopWithImage(Integer shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
    }

    /**
     * Admin: assign a vendor to a shop for the first time.
     * Fails if the shop already has a vendor, or if the vendor is already assigned elsewhere,
     * or if the user is not a VENDOR.
     */
    public Shop assignVendor(Integer shopId, Integer vendorId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("User not found: " + vendorId));

        if (vendor.getRole() != com.interim.server.enums.Role.VENDOR) {
            throw new RuntimeException("User " + vendorId + " does not have the VENDOR role");
        }
        if (shop.getVendor() != null) {
            throw new RuntimeException("Shop " + shopId + " already has vendor " + shop.getVendor().getEmployeeId() + ". Use PUT to reassign.");
        }
        shopRepository.findByVendor_EmployeeId(vendorId)
                .stream().findFirst()
                .ifPresent(s -> { throw new RuntimeException("Vendor " + vendorId + " is already assigned to shop " + s.getId()); });

        shop.setVendor(vendor);
        return shopRepository.save(shop);
    }

    /**
     * Admin: replace a shop's current vendor with a different one.
     * Fails if the shop has no vendor yet (use POST to assign first),
     * or if the new vendor is already assigned to another shop,
     * or if the new vendor does not have the VENDOR role.
     */
    public Shop reassignVendor(Integer shopId, Integer newVendorId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        User newVendor = userRepository.findById(newVendorId)
                .orElseThrow(() -> new RuntimeException("User not found: " + newVendorId));

        if (newVendor.getRole() != com.interim.server.enums.Role.VENDOR) {
            throw new RuntimeException("User " + newVendorId + " does not have the VENDOR role");
        }
        if (shop.getVendor() == null) {
            throw new RuntimeException("Shop " + shopId + " has no vendor assigned yet. Use POST to assign.");
        }
        if (shop.getVendor().getEmployeeId().equals(newVendorId)) {
            throw new RuntimeException("Vendor " + newVendorId + " is already assigned to this shop");
        }
        shopRepository.findByVendor_EmployeeId(newVendorId)
                .stream().findFirst()
                .ifPresent(s -> { throw new RuntimeException("Vendor " + newVendorId + " is already assigned to shop " + s.getId()); });

        shop.setVendor(newVendor);
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

    /** Admin: remove the vendor assignment from a shop. */
    public Shop unassignVendor(Integer shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        shop.setVendor(null);
        return shopRepository.save(shop);
    }

    public void deleteShop(Integer id) {
        shopRepository.deleteById(id);
    }
}

