package com.staynest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StayNestApplication {

	public static void main(String[] args) {
		SpringApplication.run(StayNestApplication.class, args);
	}

	@jakarta.annotation.PostConstruct
	public void heartbeat() {
		System.out.println("!!! BACKEND HEARTBEAT: CONTEXT LOADED SUCCESSFULLY !!!");
	}

}
