package com.staynest.controller;

import com.staynest.model.Booking;
import com.staynest.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {
        System.out.println("BookingController: createBooking called for User ID: " + (booking.getUser() != null ? booking.getUser().getId() : "null"));
        Booking savedBooking = bookingService.createBooking(booking);
        System.out.println("BookingController: Successfully created booking ID: " + savedBooking.getId());
        return savedBooking;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/userBookings/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/roomBookings/{roomId}")
    public List<Booking> getRoomBookings(@PathVariable Long roomId) {
        return bookingService.getRoomBookings(roomId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updateStatus/{id}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            int result = bookingService.updateBookingStatus(id, status);
            if (result > 0) {
                return ResponseEntity.ok(new com.staynest.controller.dto.AuthDtos.MessageResponse("Booking status updated successfully"));
            } else {
                return ResponseEntity.status(404).body(new com.staynest.controller.dto.AuthDtos.MessageResponse("Booking not found"));
            }
        } catch (Exception e) {
            System.err.println("BookingController.updateBookingStatus crash: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + " (" + e.getClass().getName() + ")");
        }
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
