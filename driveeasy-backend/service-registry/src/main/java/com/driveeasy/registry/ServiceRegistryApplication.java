package com.driveeasy.registry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Serveur de découverte et d'enregistrement de services Netflix Eureka.
 * Permet aux microservices DriveEasy (Vehicule, Client, Location, Gateway)
 * de s'enregistrer et de se localiser dynamiquement.
 */
@SpringBootApplication
@EnableEurekaServer
public class ServiceRegistryApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceRegistryApplication.class, args);
    }
}
