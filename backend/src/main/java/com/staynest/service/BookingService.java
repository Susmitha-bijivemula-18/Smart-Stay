package com.staynest.service;

import com.staynest.model.Booking;
import com.staynest.repository.BookingRepository;
import com.staynest.repository.PGRepository;
import com.staynest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomService roomService;

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUser_Id(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getRoomBookings(Long roomId) {
        return bookingRepository.findByRoom_Id(roomId);
    }

    public Booking createBooking(Booking booking) {
        System.out.println("BookingService: Creating booking for User: " + (booking.getUser() != null ? booking.getUser().getId() : "null") + 
                           ", PG: " + (booking.getPg() != null ? booking.getPg().getId() : "null") +
                           ", Room: " + (booking.getRoom() != null ? booking.getRoom().getId() : "null"));
        
        // --- Stability Fix: Fetch Managed User entity ---
        if (booking.getUser() != null && booking.getUser().getId() != null) {
            com.staynest.model.User managedUser = userRepository.findById(booking.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Error: User ID " + booking.getUser().getId() + " not found in local database."));
            booking.setUser(managedUser);
        } else {
            throw new RuntimeException("Error: A valid User is required to create a booking.");
        }
        
        // --- Stability: Ensure PG exists or fallback ---
        if (booking.getPg() != null && booking.getPg().getId() != null) {
            if (!pgRepository.existsById(booking.getPg().getId())) {
                System.out.println("BookingService: PG ID " + booking.getPg().getId() + " not found. Falling back to default PG for stability.");
                com.staynest.model.PG fallbackPg = pgRepository.findAll().stream().findFirst().orElse(null);
                if (fallbackPg != null) {
                    booking.setPg(fallbackPg);
                } else {
                    throw new RuntimeException("Error: No PG records found in database. Please seed the DB.");
                }
            }
        } else {
            // If No PG provided at all, we still need one due to nullable=false
            com.staynest.model.PG fallbackPg = pgRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("Error: Destination PG required."));
            booking.setPg(fallbackPg);
        }

        // If room is provided, perform room-specific logic
        if (booking.getRoom() != null && booking.getRoom().getId() != null) {
            java.util.Optional<com.staynest.model.Room> roomOpt = roomService.getRoomById(booking.getRoom().getId());
            if (roomOpt.isPresent()) {
                com.staynest.model.Room room = roomOpt.get();
                if (!room.isAvailable()) {
                    throw new RuntimeException("Error: This room is already full (Available Slots: 0/" + room.getSharingType() + ").");
                }

                // Increment occupancy
                System.out.println("BookingService: Incrementing occupancy for Room ID: " + room.getId());
                roomService.incrementOccupancy(room.getId());
            } else {
                System.out.println("BookingService: Room ID " + booking.getRoom().getId() + " not found. Treating as predicted Room simulation.");
                booking.setRoom(null); // Detach non-existent room to allow saving
            }
        }
        
        // --- Pricing Logic ---
        double amount = 0;
        double basePgPrice = (booking.getPg() != null && booking.getPg().getPrice() != null) ? booking.getPg().getPrice().doubleValue() : 8000.0;
        
        // 1. Room Price (if full pack)
        if (booking.getRoomType() != null) {
            double multiplier = 1.0;
            String type = booking.getRoomType().toLowerCase();
            if (type.contains("single")) multiplier = 1.10;
            else if (type.contains("double")) multiplier = 0.85;
            else if (type.contains("triple")) multiplier = 0.70;
            else if (type.contains("4")) multiplier = 0.58;
            else if (type.contains("5")) multiplier = 0.48;
            
            double monthlyRoom = basePgPrice * multiplier;
            if (booking.getDuration() != null && booking.getDuration() >= 12) {
                amount += (monthlyRoom * 0.85) * booking.getDuration(); // 15% discount for yearly
            } else {
                amount += monthlyRoom * (booking.getDuration() != null ? booking.getDuration() : 1);
            }
        }

        // 2. Meal Price
        if (booking.getMealPlan() != null) {
            double monthlyMeal = 0;
            String plan = booking.getMealPlan().toLowerCase();
            if (plan.contains("basic")) monthlyMeal = 3800;
            else if (plan.contains("standard")) monthlyMeal = 5200;
            else if (plan.contains("premium")) monthlyMeal = 7500;
            
            if (booking.getDuration() != null && booking.getDuration() >= 12) {
                amount += (monthlyMeal * 0.85) * booking.getDuration();
            } else {
                amount += monthlyMeal * (booking.getDuration() != null ? booking.getDuration() : 1);
            }
        }
        
        booking.setTotalAmount(amount);
        
        // Save booking (room can be null for meal-only bookings)
        try {
            return bookingRepository.save(booking);
        } catch (Exception e) {
            System.err.println("BookingService: SAVE FAILED!");
            System.err.println("Error Message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            throw e;
        }
    }

    public int updateBookingStatus(Long id, String status) {
        try {
            com.staynest.model.BookingStatus bookingStatus = com.staynest.model.BookingStatus.valueOf(status.toUpperCase());
            return bookingRepository.findById(id).map(booking -> {
                booking.setStatus(bookingStatus);
                bookingRepository.save(booking);
                return 1;
            }).orElse(0);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        // Free up a slot only if a room was attached
        if (booking.getRoom() != null) {
            roomService.decrementOccupancy(booking.getRoom().getId());
        }
        bookingRepository.deleteById(id);
    }
}
