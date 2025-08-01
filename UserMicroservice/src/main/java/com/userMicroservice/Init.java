package com.userMicroservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import jakarta.persistence.EntityManager;

public class Init implements CommandLineRunner {
	
	@Autowired
	private EntityManager em;
	
	@Autowired
	
	//If you want to run some code that must run after spring boot succesfull started;

	@Override
	public void run(String... args) throws Exception {
		// TODO Auto-generated method stub
		System.out.println("-------Are chal gya bhai-------");
		
		if(em!=null) {
			System.out.println("-------Em is created-------");
		}
		
		
	}

}
