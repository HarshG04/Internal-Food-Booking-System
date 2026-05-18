package com.interim.server.services;

import com.interim.server.models.FoodItem;
import com.interim.server.repositories.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public Optional<FoodItem> getFoodItemById(Integer id) {
        return foodItemRepository.findById(id);
    }

    public List<FoodItem> getFoodItemsByShop(Integer shopId) {
        return foodItemRepository.findByShopId(shopId);
    }

    public List<FoodItem> getVegFoodItems() {
        return foodItemRepository.findByIsVeg(true);
    }

    public List<FoodItem> getVegItemsByShop(Integer shopId) {
        return foodItemRepository.findByShopIdAndIsVeg(shopId, true);
    }

    /**
     * Search and filter food items.
     * sortBy: "rating" | "popularity" | anything else = default order
     */
    public List<FoodItem> searchAndFilter(String name, Boolean isVeg, Integer shopId,
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          Integer maxPrepTime, String sortBy) {
        if ("rating".equalsIgnoreCase(sortBy)) {
            return foodItemRepository.searchAndFilterByRating(name, isVeg, shopId, minPrice, maxPrice, maxPrepTime);
        } else if ("popularity".equalsIgnoreCase(sortBy)) {
            return foodItemRepository.searchAndFilterByPopularity(name, isVeg, shopId, minPrice, maxPrice, maxPrepTime);
        }
        return foodItemRepository.searchAndFilter(name, isVeg, shopId, minPrice, maxPrice, maxPrepTime);
    }

    public FoodItem createFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    public FoodItem updateFoodItem(Integer id, FoodItem updated) {
        return foodItemRepository.findById(id).map(existing -> {
            existing.setShop(updated.getShop());
            existing.setName(updated.getName());
            existing.setPrice(updated.getPrice());
            existing.setStockQuantity(updated.getStockQuantity());
            existing.setPrepTimeMins(updated.getPrepTimeMins());
            existing.setIsVeg(updated.getIsVeg());
            existing.setAvgRating(updated.getAvgRating());
            return foodItemRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("FoodItem not found with id: " + id));
    }

    public void deleteFoodItem(Integer id) {
        foodItemRepository.deleteById(id);
    }
}

