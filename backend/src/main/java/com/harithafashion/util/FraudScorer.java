package com.harithafashion.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Component
public class FraudScorer {

    private static final Set<String> BLACKLISTED_PINCODES = Set.of("000000", "999999");

    public int score(boolean newAccount, BigDecimal orderTotal, boolean isCod,
                     int ordersFromIpLastHour, String pincode, int returnDisputes) {
        int score = 0;
        if (newAccount && isCod && orderTotal.compareTo(new BigDecimal("5000")) > 0) score += 30;
        if (ordersFromIpLastHour > 3) score += 40;
        if (pincode != null && BLACKLISTED_PINCODES.contains(pincode)) score += 50;
        if (returnDisputes > 2) score += 25;
        return score;
    }

    public boolean isNewAccount(LocalDateTime createdAt) {
        return createdAt != null && ChronoUnit.DAYS.between(createdAt, LocalDateTime.now()) < 7;
    }
}
