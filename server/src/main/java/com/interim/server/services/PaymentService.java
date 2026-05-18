package com.interim.server.services;

import com.interim.server.enums.PaymentStatus;
import com.interim.server.models.Payment;
import com.interim.server.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Optional<Payment> getPaymentByGatewayTxnId(String gatewayTxnId) {
        return paymentRepository.findByGatewayTxnId(gatewayTxnId);
    }

    public List<Payment> getPaymentsByOrder(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(Integer id, PaymentStatus status) {
        return paymentRepository.findById(id).map(existing -> {
            existing.setStatus(status);
            return paymentRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public Payment updatePayment(Integer id, Payment updated) {
        return paymentRepository.findById(id).map(existing -> {
            existing.setOrder(updated.getOrder());
            existing.setGatewayTxnId(updated.getGatewayTxnId());
            existing.setAmount(updated.getAmount());
            existing.setMethod(updated.getMethod());
            existing.setStatus(updated.getStatus());
            existing.setPaidAt(updated.getPaidAt());
            return paymentRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}