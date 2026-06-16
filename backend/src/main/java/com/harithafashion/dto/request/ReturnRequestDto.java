package com.harithafashion.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ReturnRequestDto {
    private String returnType = "RETURN";
    private String reason;
    private String description;
    private List<String> images;
    private String exchangeSize;
    private String exchangeColor;
    private LocalDate pickupDate;
}
