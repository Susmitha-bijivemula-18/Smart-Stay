
package com.staynest.util;

import com.staynest.model.Booking;
import com.staynest.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

// @Component  // DISABLED: This crashes the app at startup if DB isn't connected yet
public class AmountFixer implements CommandLineRunner {

    @Autowired
    private BookingRepository bookingRepository;



    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("AmountFixer: Checking for bookings with missing amounts...");
        List<Booking> allBookings = bookingRepository.findAll();
        int fixedCount = 0;

        for (Booking booking : allBookings) {
            if (booking.getTotalAmount() == null || booking.getTotalAmount() == 0) {
                System.out.println("AmountFixer: Fixing amount for Booking ID: " + booking.getId());
                
                // We re-run the pricing logic by calling save through service if we had a pure calculation method.
                // Since it's inside createBooking, I'll manually trigger it here for existing ones.
                
                double amount = 0;
                double basePgPrice = (booking.getPg() != null && booking.getPg().getPrice() != null) ? 
                                     booking.getPg().getPrice().doubleValue() : 8000.0;
                
                // Room Price
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
                        amount += (monthlyRoom * 0.85) * booking.getDuration();
                    } else {
                        amount += monthlyRoom * (booking.getDuration() != null ? booking.getDuration() : 1);
                    }
                }

                // Meal Price
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
                bookingRepository.save(booking);
                fixedCount++;
            }
        }
        
        if (fixedCount > 0) {
            System.out.println("AmountFixer: Successfully fixed " + fixedCount + " bookings.");
        } else {
            System.out.println("AmountFixer: No bookings required fixing.");
        }
    }
}
