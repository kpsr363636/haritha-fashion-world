package com.harithafashion.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Stock back-in-stock alerts are triggered when seller updates stock via {@link com.harithafashion.service.SellerProductService#updateStock}.
 */
@Component
@RequiredArgsConstructor
public class StockAlertScheduler {
}
