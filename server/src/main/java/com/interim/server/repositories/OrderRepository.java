package com.interim.server.repositories;



import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.interim.server.models.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByTokenNo(String tokenNo);
    List<Order> findByUserEmployeeId(Integer employeeId);

    /** All orders that contain at least one item belonging to the given shop (for vendors). */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi " +
            "WHERE oi.foodItem.shop.id = :shopId ORDER BY o.createdAt DESC")
    List<Order> findByShopId(@Param("shopId") Integer shopId);

    /**
     * Returns true if there is an active (not fully delivered) order using this token.
     * A token is considered free once every item in its order has status DELIVERED.
     */
    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.tokenNo = :tokenNo " +
            "AND EXISTS (SELECT oi FROM o.orderItems oi WHERE oi.status <> com.interim.server.enums.OrderItemStatus.DELIVERED)")
    boolean isTokenActive(@Param("tokenNo") String tokenNo);
}
