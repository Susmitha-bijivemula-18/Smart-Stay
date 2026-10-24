package com.staynest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "Rooms")
@Data
@NoArgsConstructor
public class Room {

    @Id
    @Column(name = "room_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pg_id", nullable = false)
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private PG pg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Floor floor;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private Integer sharingType;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer occupiedSlots = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public boolean isAvailable() {
        if (occupiedSlots == null || sharingType == null) return true;
        return occupiedSlots < sharingType;
    }
}
