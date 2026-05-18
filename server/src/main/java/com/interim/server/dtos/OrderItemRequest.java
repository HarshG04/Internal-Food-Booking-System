package com.interim.server.dtos;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Integer foodItemId;
    private Integer quantity;
}
