package com.interim.server.repositories;



import com.interim.server.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByTokenNo(String tokenNo);
    List<Order> findByUserEmployeeId(Integer employeeId);

    /** All orders that contain at least one item belonging to the given shop (for vendors). */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi " +
            "WHERE oi.foodItem.shop.id = :shopId ORDER BY o.createdAt DESC")
    List<Order> findByShopId(@Param("shopId") Integer shopId);
}
