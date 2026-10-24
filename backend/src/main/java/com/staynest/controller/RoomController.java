package com.staynest.controller;

import com.staynest.model.Room;
import com.staynest.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/byPG/{pgId}")
    public ResponseEntity<?> getByPG(@PathVariable Long pgId) {
        try {
            System.out.println("RoomController: Fetching rooms for PG ID: " + pgId);
            List<Room> rooms = roomService.getRoomsByPG(pgId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            System.err.println("!!! RoomController: Fetch rooms failed for PG ID " + pgId + " !!!");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching rooms: " + e.getMessage());
        }
    }

    @GetMapping("/byFloor/{floorId}")
    public List<Room> getByFloor(@PathVariable Long floorId) {
        return roomService.getRoomsByFloor(floorId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public Room create(@RequestBody Room room) {
        return roomService.saveRoom(room);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/incrementOccupancy/{roomId}")
    public ResponseEntity<Room> incrementOccupancy(@PathVariable Long roomId) {
        try {
            return ResponseEntity.ok(roomService.incrementOccupancy(roomId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/decrementOccupancy/{roomId}")
    public ResponseEntity<Room> decrementOccupancy(@PathVariable Long roomId) {
        try {
            return ResponseEntity.ok(roomService.decrementOccupancy(roomId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }
}
