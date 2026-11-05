package com.secondserve.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodDonation {

    @Id
    private String id; // e.g. SEC-1001

    @Column(nullable = false)
    private String donorId;

    @Column(nullable = false)
    private String donorName;

    @Column(nullable = false)
    private String pickupAddress;

    private String donorPhone;

    @Column(nullable = false)
    private String foodName;

    private String category; // COOKED_MEALS, BAKERY, FRESH_PRODUCE, etc.
    private String dietary;  // VEG, NON_VEG, VEGAN
    private String quantity;
    private Integer servings;
    private String prepTime;
    private LocalDateTime availableUntil;
    private String storageCondition;

    @Column(columnDefinition = "TEXT")
    private String foodSafetyInfo;
    private String allergens;
    private String imageUrl;

    private String status; // LISTED, REQUESTED, APPROVED, VOLUNTEER_ASSIGNED, PICKED_UP, DELIVERED, DISTRIBUTION_COMPLETED

    private String currentRequestId;
    private String assignedVolunteerId;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "LISTED";
    }
}
