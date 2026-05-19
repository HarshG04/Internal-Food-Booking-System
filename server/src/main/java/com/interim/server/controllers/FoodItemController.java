package com.interim.server.controllers;


import com.interim.server.models.FoodItem;
import com.interim.server.services.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    @GetMapping
    public List<FoodItem> getAllFoodItems() {
        return foodItemService.getAllFoodItems();
    }

    /**
     * GET /api/food-items/search
     * Optional params: name, isVeg, shopId, minPrice, maxPrice, maxPrepTime
     * sortBy: "rating" | "popularity" | (omit for default)
     */
    @GetMapping("/search")
    public List<FoodItem> searchFoodItems(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isVeg,
            @RequestParam(required = false) Integer shopId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer maxPrepTime,
            @RequestParam(required = false) String sortBy) {
        return foodItemService.searchAndFilter(name, isVeg, shopId, minPrice, maxPrice, maxPrepTime, sortBy);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Integer id) {
        return foodItemService.getFoodItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/shop/{shopId}")
    public List<FoodItem> getFoodItemsByShop(@PathVariable Integer shopId) {
        return foodItemService.getFoodItemsByShop(shopId);
    }

    @GetMapping("/shop/{shopId}/veg")
    public List<FoodItem> getVegItemsByShop(@PathVariable Integer shopId) {
        return foodItemService.getVegItemsByShop(shopId);
    }

    @GetMapping("/veg")
    public List<FoodItem> getVegFoodItems() {
        return foodItemService.getVegFoodItems();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Void> uploadFoodItemImage(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) throws IOException {
        foodItemService.uploadImage(id, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getFoodItemImage(@PathVariable Integer id) {
        FoodItem foodItem = foodItemService.getFoodItemWithImage(id);
        if (foodItem.getImage() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foodItem.getImageType()))
                .body(foodItem.getImage());
    }

    @PostMapping
    public ResponseEntity<FoodItem> createFoodItem(@RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodItemService.createFoodItem(foodItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(@PathVariable Integer id, @RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, foodItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Integer id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
}

