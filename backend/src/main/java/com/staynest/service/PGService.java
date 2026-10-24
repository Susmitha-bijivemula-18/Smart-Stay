package com.staynest.service;

import com.staynest.model.PG;
import com.staynest.repository.PGRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PGService {

    @Autowired
    private PGRepository pgRepository;

    public List<PG> getAllPGs() {
        return pgRepository.findAll();
    }

    public List<PG> getPGsByLocation(String city, String state) {
        return pgRepository.findByCityAndState(city, state);
    }

    public Optional<PG> getPGById(Long id) {
        return pgRepository.findById(id);
    }

    public PG savePG(PG pg) {
        return pgRepository.save(pg);
    }

    public PG updatePG(Long id, PG pgDetails) {
        PG pg = pgRepository.findById(id).orElseThrow(() -> new RuntimeException("PG not found API"));
        pg.setPgName(pgDetails.getPgName());
        pg.setCity(pgDetails.getCity());
        pg.setState(pgDetails.getState());
        pg.setArea(pgDetails.getArea());
        pg.setAddress(pgDetails.getAddress());
        pg.setPrice(pgDetails.getPrice());
        pg.setDescription(pgDetails.getDescription());
        pg.setLatitude(pgDetails.getLatitude());
        pg.setLongitude(pgDetails.getLongitude());
        
        return pgRepository.save(pg);
    }

    public void deletePG(Long id) {
        pgRepository.deleteById(id);
    }
}
