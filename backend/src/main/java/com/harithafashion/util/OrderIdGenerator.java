package com.harithafashion.util;

import com.harithafashion.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class OrderIdGenerator {

    private final OrderRepository orderRepository;
    private final AtomicInteger sequence = new AtomicInteger(100000);

    public OrderIdGenerator(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    void initSequenceFromDatabase() {
        String year = String.valueOf(Year.now().getValue());
        Integer maxSeq = orderRepository.findMaxSequenceForYear(year);
        if (maxSeq != null && maxSeq >= sequence.get()) {
            sequence.set(maxSeq);
        }
    }

    public String generate() {
        return String.format("HF-%d-%06d", Year.now().getValue(), sequence.incrementAndGet());
    }
}
