package com.driveeasy.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"spring.profiles.active=native", "eureka.client.enabled=false"})
class ConfigServerApplicationTests {

    @Test
    void contextLoads() {
        // Valide le démarrage du Config Server
    }
}
