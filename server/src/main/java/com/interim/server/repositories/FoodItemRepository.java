package com.interim.server.repositories;

import com.interim.server.models.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Integer> {

    List<FoodItem> findByShopId(Integer shopId);
    List<FoodItem> findByIsVeg(Boolean isVeg);
    List<FoodItem> findByShopIdAndIsVeg(Integer shopId, Boolean isVeg);

    // ── Search + filter (default order) ─────────────────────────────────────
    @Query("SELECT fi FROM FoodItem fi WHERE " +
            "(:name IS NULL OR LOWER(fi.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:isVeg IS NULL OR fi.isVeg = :isVeg) AND " +
            "(:shopId IS NULL OR fi.shop.id = :shopId) AND " +
            "(:minPrice IS NULL OR fi.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR fi.price <= :maxPrice) AND " +
            "(:maxPrepTime IS NULL OR fi.prepTimeMins <= :maxPrepTime)")
    List<FoodItem> searchAndFilter(@Param("name") String name,
                                   @Param("isVeg") Boolean isVeg,
                                   @Param("shopId") Integer shopId,
                                   @Param("minPrice") BigDecimal minPrice,
                                   @Param("maxPrice") BigDecimal maxPrice,
                                   @Param("maxPrepTime") Integer maxPrepTime);

    // ── Search + filter sorted by rating DESC ────────────────────────────────
    @Query("SELECT fi FROM FoodItem fi WHERE " +
            "(:name IS NULL OR LOWER(fi.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:isVeg IS NULL OR fi.isVeg = :isVeg) AND " +
            "(:shopId IS NULL OR fi.shop.id = :shopId) AND " +
            "(:minPrice IS NULL OR fi.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR fi.price <= :maxPrice) AND " +
            "(:maxPrepTime IS NULL OR fi.prepTimeMins <= :maxPrepTime) " +
            "ORDER BY COALESCE(fi.avgRating, -1) DESC")
    List<FoodItem> searchAndFilterByRating(@Param("name") String name,
                                           @Param("isVeg") Boolean isVeg,
                                           @Param("shopId") Integer shopId,
                                           @Param("minPrice") BigDecimal minPrice,
                                           @Param("maxPrice") BigDecimal maxPrice,
                                           @Param("maxPrepTime") Integer maxPrepTime);

    // ── Search + filter sorted by popularity (total orders) DESC ─────────────
    @Query("SELECT fi FROM FoodItem fi WHERE " +
            "(:name IS NULL OR LOWER(fi.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:isVeg IS NULL OR fi.isVeg = :isVeg) AND " +
            "(:shopId IS NULL OR fi.shop.id = :shopId) AND " +
            "(:minPrice IS NULL OR fi.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR fi.price <= :maxPrice) AND " +
            "(:maxPrepTime IS NULL OR fi.prepTimeMins <= :maxPrepTime) " +
            "ORDER BY (SELECT COUNT(oi) FROM OrderItem oi WHERE oi.foodItem = fi) DESC")
    List<FoodItem> searchAndFilterByPopularity(@Param("name") String name,
                                               @Param("isVeg") Boolean isVeg,
                                               @Param("shopId") Integer shopId,
                                               @Param("minPrice") BigDecimal minPrice,
                                               @Param("maxPrice") BigDecimal maxPrice,
                                               @Param("maxPrepTime") Integer maxPrepTime);
}

