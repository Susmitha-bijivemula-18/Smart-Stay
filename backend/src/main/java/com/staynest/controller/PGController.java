package com.staynest.controller;

import com.staynest.model.PG;
import com.staynest.service.PGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pg")
public class PGController {

    @Autowired
    private PGService pgService;

    @GetMapping("/list")
    public List<PG> getAll() {
        return pgService.getAllPGs();
    }

    @GetMapping("/search")
    public List<PG> search(@RequestParam String city, @RequestParam String state) {
        return pgService.getPGsByLocation(city, state);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PG> getById(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            return pgService.getPGById(numericId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            // For AI-suggested PGs that aren't in the DB yet, we return 404
            // The frontend has fallback mock data for these cases.
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public PG create(@RequestBody PG pg) {
        return pgService.savePG(pg);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<PG> update(@PathVariable Long id, @RequestBody PG pgDetails) {
        try {
            return ResponseEntity.ok(pgService.updatePG(id, pgDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        pgService.deletePG(id);
        return ResponseEntity.ok().build();
    }
}
