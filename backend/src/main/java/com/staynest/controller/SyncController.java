package com.staynest.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.staynest.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/sync")
public class SyncController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private com.staynest.repository.BookingRepository bookingRepository;

    @Autowired
    private com.staynest.repository.RoomRepository roomRepository;

    private static final String DATA_FILE = "bookings_persist.json";
    private static final List<Map<String, Object>> globalBookings = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        loadData();
    }

    private void loadData() {
        File file = new File(DATA_FILE);
        if (file.exists() && file.length() > 0) {
            try {
                List<Map<String, Object>> loaded = objectMapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});
                globalBookings.clear();
                globalBookings.addAll(loaded);
                System.out.println("Loaded " + globalBookings.size() + " persistent bookings.");
            } catch (IOException e) {
                System.err.println("Error loading persistence data: " + e.getMessage());
            }
        }
    }

    private void saveData() {
        try {
            objectMapper.writeValue(new File(DATA_FILE), globalBookings);
        } catch (IOException e) {
            System.err.println("Error saving persistence data: " + e.getMessage());
        }
    }

    @PostMapping("/book")
    public void addBooking(@RequestBody Map<String, Object> booking) {
        globalBookings.add(booking);
        saveData();
    }

    @PostMapping("/release")
    @SuppressWarnings("unchecked")
    public void releaseBooking(@RequestBody Map<String, Object> request) {
        String pgName = (String) request.get("pgName");
        Object roomIdObj = request.get("roomId");
        String bookingDate = (String) request.get("bookingDate");
        
        Long roomId = roomIdObj instanceof Integer ? ((Integer) roomIdObj).longValue() : Long.valueOf(roomIdObj.toString());

        globalBookings.removeIf(b -> {
            Map<String, Object> pg = (Map<String, Object>) b.get("pg");
            Map<String, Object> roomMap = (Map<String, Object>) b.get("room");
            String bDate = (String) b.get("bookingDate");

            boolean match = pg != null && pgName.equals(pg.get("pgName")) &&
                   roomMap != null && roomId.equals(Long.valueOf(roomMap.get("roomId").toString())) &&
                   (bookingDate == null || bookingDate.equals(bDate));
            
            if (match) {
                try {
                    roomService.decrementOccupancy(roomId);
                } catch (Exception e) {
                    System.err.println("Failed to decrement DB occupancy for room " + roomId + ": " + e.getMessage());
                }
            }
            return match;
        });
        saveData();
    }

    @GetMapping("/bookings")
    public List<Map<String, Object>> getBookings() {
        return globalBookings;
    }

    @DeleteMapping("/clear")
    @Transactional
    public void clearBookings() {
        System.out.println("SyncController: Performing FULL SYSTEM RESET...");
        
        // 1. Clear Local Sync Data
        globalBookings.clear();
        saveData();
        
        // 2. Clear MySQL Bookings
        try {
            bookingRepository.deleteAll();
            System.out.println("SyncController: All MySQL bookings deleted.");
        } catch (Exception e) {
            System.err.println("SyncController: Failed to clear MySQL bookings: " + e.getMessage());
        }
        
        // 3. Reset Room Occupancy in MySQL
        try {
            List<com.staynest.model.Room> allRooms = roomRepository.findAll();
            for (com.staynest.model.Room room : allRooms) {
                if (room.getOccupiedSlots() != 0) {
                    room.setOccupiedSlots(0);
                    roomRepository.save(room);
                }
            }
            System.out.println("SyncController: All room occupancies reset to 0.");
        } catch (Exception e) {
            System.err.println("SyncController: Failed to reset room occupancies: " + e.getMessage());
        }
    }
}
