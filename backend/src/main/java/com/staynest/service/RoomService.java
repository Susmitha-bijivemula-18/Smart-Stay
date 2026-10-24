package com.staynest.service;

import com.staynest.model.Room;
import com.staynest.repository.PGRepository;
import com.staynest.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PGRepository pgRepository;

    public List<Room> getRoomsByPG(Long pgId) {
        if (pgId == null || !pgRepository.existsById(pgId)) {
            System.out.println("RoomService: PG ID " + pgId + " not found or null. Returning empty list.");
            return Collections.emptyList();
        }
        List<Room> rooms = roomRepository.findByPgId(pgId);
        System.out.println("RoomService: Found " + rooms.size() + " rooms for PG ID: " + pgId);
        if (!rooms.isEmpty()) {
            System.out.println("RoomService: First room occupancy: " + rooms.get(0).getOccupiedSlots());
        }
        return rooms;
    }

    public List<Room> getRoomsByFloor(Long floorId) {
        return roomRepository.findByFloor_Id(floorId);
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room incrementOccupancy(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if (room.getOccupiedSlots() >= room.getSharingType()) {
            throw new RuntimeException("Room is already full");
        }
        System.out.println("RoomService: Incrementing occupancy for Room ID: " + roomId + ". Old value: " + room.getOccupiedSlots());
        room.setOccupiedSlots(room.getOccupiedSlots() + 1);
        Room savedRoom = roomRepository.save(room);
        System.out.println("RoomService: Occupancy incremented. New value: " + savedRoom.getOccupiedSlots());
        return savedRoom;
    }

    public Room decrementOccupancy(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if (room.getOccupiedSlots() > 0) {
            room.setOccupiedSlots(room.getOccupiedSlots() - 1);
        }
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}
