package com.interim.server.repositories;




import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderId(Integer orderId);
    List<OrderItem> findByUser_EmployeeId(Integer userId);
    List<OrderItem> findByStatus(OrderItemStatus status);
    List<OrderItem> findByOrderIdAndStatus(Integer orderId, OrderItemStatus status);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.foodItem.shop.id = :shopId ORDER BY oi.order.createdAt DESC")
    List<OrderItem> findByFoodItemShopId(@Param("shopId") Integer shopId);

    // ── Revenue queries for admin ────────────────────────────────────────────
    @Query("SELECT SUM(oi.subtotal) FROM OrderItem oi WHERE oi.foodItem.shop.id = :shopId")
    BigDecimal getTotalRevenueByShop(@Param("shopId") Integer shopId);

    @Query("SELECT SUM(oi.subtotal) FROM OrderItem oi WHERE oi.foodItem.shop.floor.id = :floorId")
    BigDecimal getTotalRevenueByFloor(@Param("floorId") Integer floorId);

    @Query("SELECT SUM(oi.subtotal) FROM OrderItem oi " +
            "WHERE oi.order.createdAt >= :from AND oi.order.createdAt < :to")
    BigDecimal getTotalRevenueByDateRange(@Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    @Query("SELECT oi.foodItem.shop.id, SUM(oi.subtotal) FROM OrderItem oi GROUP BY oi.foodItem.shop.id")
    List<Object[]> getRevenueGroupedByShop();

    @Query("SELECT oi.foodItem.shop.floor.id, SUM(oi.subtotal) FROM OrderItem oi GROUP BY oi.foodItem.shop.floor.id")
    List<Object[]> getRevenueGroupedByFloor();
}
