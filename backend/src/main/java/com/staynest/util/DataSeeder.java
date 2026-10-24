package com.staynest.util;

import com.staynest.model.PG;
import com.staynest.model.Room;
import com.staynest.model.Floor;
import com.staynest.repository.PGRepository;
import com.staynest.repository.RoomRepository;
import com.staynest.repository.FloorRepository;
import com.staynest.repository.UserRepository;
import com.staynest.model.User;
import com.staynest.model.Role;
import com.staynest.model.AuthProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public void run(String... args) {
        // DEFINITIVE FIX: Run seeding in a BACKGROUND THREAD so Render doesn't kill the app for a 'startup timeout'
        new Thread(() -> {
            try {
                // Wait 10 seconds for the cloud connection to stabilize
                Thread.sleep(10000);
                performSeeding();
            } catch (Exception e) {
                System.err.println("DataSeeder: Background Seeding CRITICAL ERROR: " + e.getMessage());
            }
        }).start();
        System.out.println("DataSeeder: BACKGROUND SEEDING STARTED. Backend is now entering 'Ready' state.");
    }

    private void performSeeding() {
        try {
            System.out.println("DataSeeder: Checking database state...");
            
            // Ensure Admin User exists
            if (!userRepository.existsByEmail("admin@staynest.com")) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@staynest.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setProvider(AuthProvider.LOCAL);
                userRepository.save(admin);
            } else {
                User admin = userRepository.findByEmail("admin@staynest.com").get();
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
            }

            // Always recreate the exact 10 PGs to ensure perfect demo state
            System.out.println("DataSeeder: Purging existing PGs to guarantee exact 10-PG demo state...");
            roomRepository.deleteAll();
            floorRepository.deleteAll();
            pgRepository.deleteAll();

            System.out.println("DataSeeder: Seeding exactly 10 Premium PGs...");
            
            String[] types = {"Boys", "Boys", "Boys", "Boys", "Girls", "Girls", "Girls", "Both", "Both", "Both"};
            String[] names = {
                "Titanium Boys Hostel", "Spartan Men's PG", "Elite Boys Living", "Alpha Male Stays",
                "Serenity Girls PG", "Blossom Women's Stay", "SafeHaven Girls Hostel",
                "Harmony Coliving", "Urban Nest Shared", "Zenith Colive Hub"
            };
            String[] prices = {"6500", "7000", "6000", "7500", "8000", "7500", "8500", "9000", "10000", "8500"};
            String[] ratings = {"4.5", "4.2", "4.7", "4.8", "4.9", "4.6", "4.8", "4.9", "4.7", "4.5"};

            for (int i = 0; i < 10; i++) {
                final long pgId = i + 1;
                PG newPg = new PG();
                newPg.setId(pgId);
                newPg.setPgName(names[i]);
                newPg.setCity("Universal City");
                newPg.setState("Universal State");
                newPg.setArea("Premium Zone");
                newPg.setAddress(pgId + " Luxury Lane");
                newPg.setPrice(new BigDecimal(prices[i]));
                newPg.setDescription("Premium " + types[i] + " accommodation with all amenities.");
                newPg.setType(types[i]);
                newPg.setRating(ratings[i]);
                
                // Add mock latitude and longitude for google maps (centered around 17.4, 78.4)
                newPg.setLatitude(new BigDecimal("17." + (4000 + i*10)));
                newPg.setLongitude(new BigDecimal("78." + (4000 + i*10)));
                
                PG savedPg = pgRepository.save(newPg);

                // Create 5 Floors for each PG
                for (int f = 1; f <= 5; f++) {
                    Floor newFloor = new Floor();
                    newFloor.setFloorNumber(f);
                    newFloor.setPg(savedPg);
                    Floor savedFloor = floorRepository.save(newFloor);

                    // Create 10 Rooms for each floor
                    for (int r = 1; r <= 10; r++) {
                        long roomId = (pgId * 1000) + (f * 100) + r;
                        Room room = new Room();
                        room.setId(roomId);
                        room.setPg(savedPg);
                        room.setFloor(savedFloor);
                        room.setRoomType(r % 2 == 0 ? "AC" : "Non-AC");
                        room.setSharingType(f == 1 ? 1 : f == 2 ? 2 : 3); 
                        room.setOccupiedSlots(0);
                        room.setPrice(new BigDecimal(prices[i]));
                        roomRepository.save(room);
                    }
                }
            }
            
            System.out.println("DataSeeder: !!! BACKGROUND SEEDING COMPLETE !!! (10 PGs created).");
        } catch (Exception e) {
            System.err.println("!!! DATA SEEDER FAILED !!!");
            e.printStackTrace();
        }
    }
}
