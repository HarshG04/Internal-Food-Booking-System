package com.interim.server.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_veg")
    private Boolean isVeg;

    @Column(name = "is_open")
    private Boolean isOpen;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @JsonIgnore
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<FoodItem> foodItems;
}

