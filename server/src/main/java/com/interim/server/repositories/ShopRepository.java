package com.interim.server.repositories;

import com.interim.server.models.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Integer> {
    List<Shop> findByFloorId(Integer floorId);
    List<Shop> findByIsOpen(Boolean isOpen);
    List<Shop> findByIsVeg(Boolean isVeg);
    List<Shop> findByVendor_EmployeeId(Integer employeeId);
}
