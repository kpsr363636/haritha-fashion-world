package com.harithafashion.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipmentSummaryResponse {
    private String trackingNumber;
    private String awbNumber;
    private String courierName;
    private String trackingUrl;
    private String status;
}
