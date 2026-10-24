package com.staynest.repository;

import com.staynest.model.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PGRepository extends JpaRepository<PG, Long> {
    List<PG> findByCityAndState(String city, String state);
}
