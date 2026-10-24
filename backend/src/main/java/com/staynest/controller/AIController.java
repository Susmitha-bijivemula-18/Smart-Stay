package com.staynest.controller;

import com.staynest.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Update with your specific Netlify origin if needed
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * Get PG recommendations based on location (State, City, Area).
     */
    @PostMapping("/predict")
    public Object predict(@RequestBody Map<String, String> request) {
        String city = request.get("city");
        String state = request.get("state");
        String area = request.get("area");
        
        return aiService.getPGRecommendations(city, state, area);
    }

    /**
     * Discover locations in a state.
     */
    @PostMapping("/locations")
    public Object locations(@RequestBody Map<String, String> request) {
        String state = request.get("state");
        
        return aiService.discoverLocations(state);
    }
}
