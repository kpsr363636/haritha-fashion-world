package com.harithafashion.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class GstCalculator {

    private GstCalculator() {}

    public static BigDecimal getGstRate(String categorySlug, BigDecimal price) {
        BigDecimal threshold = new BigDecimal("1000");
        return switch (categorySlug) {
            case "sarees-ethnic-wear", "western-clothing", "footwear", "scarves-dupattas" ->
                    price.compareTo(threshold) < 0 ? new BigDecimal("5") : new BigDecimal("12");
            case "fine-jewellery", "fashion-accessories" -> new BigDecimal("3");
            case "beauty-skincare", "bags-handbags", "watches-eyewear" -> new BigDecimal("18");
            case "hair-accessories" -> new BigDecimal("12");
            default -> new BigDecimal("5");
        };
    }

    public static BigDecimal extractGst(BigDecimal inclusivePrice, BigDecimal gstRate) {
        BigDecimal divisor = BigDecimal.ONE.add(gstRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal base = inclusivePrice.divide(divisor, 2, RoundingMode.HALF_UP);
        return inclusivePrice.subtract(base);
    }

    public static BigDecimal extractBase(BigDecimal inclusivePrice, BigDecimal gstRate) {
        BigDecimal divisor = BigDecimal.ONE.add(gstRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        return inclusivePrice.divide(divisor, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal splitCgst(BigDecimal gstAmount) {
        return gstAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal splitSgst(BigDecimal gstAmount) {
        return gstAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
    }
}
