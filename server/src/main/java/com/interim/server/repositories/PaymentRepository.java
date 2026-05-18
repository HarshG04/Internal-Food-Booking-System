package com.interim.server.repositories;

import com.interim.server.enums.PaymentStatus;
import com.interim.server.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByGatewayTxnId(String gatewayTxnId);
    List<Payment> findByOrderId(Integer orderId);
    List<Payment> findByStatus(PaymentStatus status);
}