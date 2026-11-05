package com.secondserve.controller;

import com.secondserve.entity.FoodDonation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class FoodDonationController {

    // REST API endpoints demonstrating Spring Boot operations for the college demo
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDonations() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "SEC-1001",
                "foodName", "Executive Banquet Basmati Pilaf & Paneer Curry",
                "category", "Cooked Meals",
                "servings", 65,
                "status", "LISTED"
            ),
            Map.of(
                "id", "SEC-1002",
                "foodName", "Artisan Sourdough Loaves & Croissants Assortment",
                "category", "Bakery",
                "servings", 95,
                "status", "REQUESTED"
            )
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDonation(@RequestBody FoodDonation donation) {
        String id = "SEC-" + (new Random().nextInt(9000) + 1000);
        donation.setId(id);
        return ResponseEntity.ok(Map.of(
            "message", "Food donation listed successfully",
            "donationId", id,
            "status", "LISTED"
        ));
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<?> requestDonation(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "message", "Surplus food requested by NGO. Locked against duplicate claims.",
            "donationId", id,
            "status", "REQUESTED"
        ));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveDonation(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
            "message", "Donation approved. Volunteer dispatch broadcast triggered.",
            "donationId", id,
            "status", "APPROVED"
        ));
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<?> updateTrackingStatus(@PathVariable String id, @RequestParam String nextStatus) {
        return ResponseEntity.ok(Map.of(
            "donationId", id,
            "status", nextStatus,
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
