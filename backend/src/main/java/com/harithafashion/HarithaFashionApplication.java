package com.harithafashion;

import com.harithafashion.config.DevDatabaseBootstrap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class HarithaFashionApplication {

    public static void main(String[] args) {
        DevDatabaseBootstrap.prepare();
        SpringApplication.run(HarithaFashionApplication.class, args);
    }
}
