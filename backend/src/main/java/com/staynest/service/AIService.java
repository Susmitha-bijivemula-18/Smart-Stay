package com.staynest.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;

@Service
public class AIService {

    @Value("${app.ai-service-url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Call the Python AI Service to get PG recommendations based on location.
     */
    public Object getPGRecommendations(String city, String state, String area) {
        String url = aiServiceUrl + "/predict";
        
        Map<String, String> request = new HashMap<>();
        request.put("city", city);
        request.put("state", state);
        if (area != null) request.put("area", area);

        try {
            return restTemplate.postForObject(url, request, Object.class);
        } catch (Exception e) {
            return Map.of("error", "AI Service unavailable: " + e.getMessage());
        }
    }

    /**
     * Call the Python AI Service to discover locations in a state.
     */
    public Object discoverLocations(String state) {
        String url = aiServiceUrl + "/locations";
        
        Map<String, String> request = new HashMap<>();
        request.put("state", state);

        try {
            return restTemplate.postForObject(url, request, Object.class);
        } catch (Exception e) {
            return Map.of("error", "AI Service unavailable: " + e.getMessage());
        }
    }
}
