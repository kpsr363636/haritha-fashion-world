package com.harithafashion.util;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OrderIdGenerator {

    private final AtomicInteger sequence = new AtomicInteger(100000);

    public String generate() {
        return String.format("HF-%d-%06d", Year.now().getValue(), sequence.incrementAndGet());
    }
}
