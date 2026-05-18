package com.interim.server.dtos;

import lombok.Data;
import java.util.List;

@Data
public class PlaceOrderRequest {
    private Integer userId;
    private List<OrderItemRequest> items;
}
