package com.habithacker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HabitHackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HabitHackerApplication.class, args);
    }
}
