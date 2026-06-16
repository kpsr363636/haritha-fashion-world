package com.harithafashion.service;

import com.harithafashion.dto.request.CreateProductRequest;
import com.harithafashion.dto.request.ProductVariantRequest;
import com.harithafashion.entity.Seller;
import com.harithafashion.exception.BadRequestException;
import com.harithafashion.repository.CategoryRepository;
import com.harithafashion.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkUploadService {

    private final SellerProductService sellerProductService;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;

    private static final String[] EXCEL_HEADERS = {
            "name", "description", "category", "basePrice", "sellingPrice",
            "gstPercent", "size", "color", "stock", "sku", "fabric", "brand"
    };

    public Map<String, Object> processExcel(MultipartFile file, UUID sellerId) {
        List<String> errors = new ArrayList<>();
        List<String> created = new ArrayList<>();

        Seller seller = sellerRepository.findByUserId(sellerId)
                .orElseThrow(() -> new BadRequestException("Seller profile not found"));

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) throw new BadRequestException("Excel has no header row");

            Map<String, Integer> colIndex = buildColumnIndex(headerRow);
            validateHeaders(colIndex, errors);

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isRowEmpty(row)) continue;
                try {
                    CreateProductRequest req = buildRequest(row, colIndex);
                    sellerProductService.createProduct(sellerId, req);
                    created.add("Row " + (r + 1) + ": " + getCellStr(row, colIndex, "name"));
                } catch (Exception e) {
                    errors.add("Row " + (r + 1) + ": " + e.getMessage());
                    log.warn("Bulk upload row {} error: {}", r + 1, e.getMessage());
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse Excel: " + e.getMessage());
        }

        return Map.of(
                "created", created.size(),
                "errors", errors.size(),
                "createdProducts", created,
                "errorDetails", errors);
    }

    public Map<String, Object> processCsv(MultipartFile file, UUID sellerId) {
        List<String> errors = new ArrayList<>();
        List<String> created = new ArrayList<>();

        sellerRepository.findByUserId(sellerId)
                .orElseThrow(() -> new BadRequestException("Seller profile not found"));

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) throw new BadRequestException("CSV is empty");
            String[] headers = headerLine.split(",");
            Map<String, Integer> colIndex = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                colIndex.put(headers[i].trim().toLowerCase(), i);
            }
            validateHeaders(colIndex, errors);

            String line;
            int rowNum = 2;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) { rowNum++; continue; }
                String[] cols = line.split(",", -1);
                try {
                    CreateProductRequest req = buildRequestFromCsv(cols, colIndex);
                    sellerProductService.createProduct(sellerId, req);
                    created.add("Row " + rowNum + ": " + (colIndex.containsKey("name") ? cols[colIndex.get("name")].trim() : "?"));
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
                rowNum++;
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse CSV: " + e.getMessage());
        }

        return Map.of(
                "created", created.size(),
                "errors", errors.size(),
                "createdProducts", created,
                "errorDetails", errors);
    }

    public String generateTemplate() {
        return String.join(",", EXCEL_HEADERS) + "\n" +
                "Sample Banarasi Saree,Beautiful hand-woven saree,Sarees,2500,1999,5,Free Size,Red,50,SKU001,Silk,Banarasi";
    }

    // ---------------------------------------------------------------
    private Map<String, Integer> buildColumnIndex(Row headerRow) {
        Map<String, Integer> idx = new HashMap<>();
        for (Cell cell : headerRow) {
            String h = cell.getStringCellValue().trim().toLowerCase();
            idx.put(h, cell.getColumnIndex());
        }
        return idx;
    }

    private void validateHeaders(Map<String, Integer> colIndex, List<String> errors) {
        List<String> required = List.of("name", "description", "category", "baseprice", "sellingprice");
        for (String h : required) {
            if (!colIndex.containsKey(h)) {
                errors.add("Missing required column: " + h);
            }
        }
    }

    private CreateProductRequest buildRequest(Row row, Map<String, Integer> idx) {
        CreateProductRequest req = new CreateProductRequest();
        req.setName(requireCellStr(row, idx, "name"));
        req.setDescription(requireCellStr(row, idx, "description"));
        req.setCategoryId(resolveCategoryId(getCellStr(row, idx, "category")));
        req.setBasePrice(parseBD(getCellStr(row, idx, "baseprice")));
        req.setMrp(parseBD(getCellStr(row, idx, "baseprice")));
        req.setGstPercent(new BigDecimal(parseIntSafe(getCellStr(row, idx, "gstpercent"), 5)));
        req.setFabric(getCellStr(row, idx, "fabric"));

        // Build a single variant
        ProductVariantRequest variant = new ProductVariantRequest();
        variant.setSize(getCellStr(row, idx, "size"));
        variant.setColor(getCellStr(row, idx, "color"));
        variant.setSku(getCellStr(row, idx, "sku"));
        variant.setStockQuantity(parseIntSafe(getCellStr(row, idx, "stock"), 0));
        req.setVariants(List.of(variant));
        return req;
    }

    private CreateProductRequest buildRequestFromCsv(String[] cols, Map<String, Integer> idx) {
        CreateProductRequest req = new CreateProductRequest();
        req.setName(requireCsvStr(cols, idx, "name"));
        req.setDescription(requireCsvStr(cols, idx, "description"));
        req.setCategoryId(resolveCategoryId(getCsvStr(cols, idx, "category")));
        req.setBasePrice(parseBD(getCsvStr(cols, idx, "baseprice")));
        req.setMrp(parseBD(getCsvStr(cols, idx, "baseprice")));
        req.setGstPercent(new BigDecimal(parseIntSafe(getCsvStr(cols, idx, "gstpercent"), 5)));
        req.setFabric(getCsvStr(cols, idx, "fabric"));

        ProductVariantRequest variant = new ProductVariantRequest();
        variant.setSize(getCsvStr(cols, idx, "size"));
        variant.setColor(getCsvStr(cols, idx, "color"));
        variant.setSku(getCsvStr(cols, idx, "sku"));
        variant.setStockQuantity(parseIntSafe(getCsvStr(cols, idx, "stock"), 0));
        req.setVariants(List.of(variant));
        return req;
    }

    private java.util.UUID resolveCategoryId(String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            return categoryRepository.findAll().stream().findFirst()
                    .map(c -> c.getId())
                    .orElseThrow(() -> new BadRequestException("No categories found"));
        }
        return categoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName.trim()))
                .findFirst()
                .map(c -> c.getId())
                .orElseThrow(() -> new BadRequestException("Category not found: " + categoryName));
    }

    private String getCellStr(Row row, Map<String, Integer> idx, String col) {
        Integer i = idx.get(col);
        if (i == null) return "";
        Cell cell = row.getCell(i);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toString()
                    : String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String requireCellStr(Row row, Map<String, Integer> idx, String col) {
        String v = getCellStr(row, idx, col);
        if (v.isBlank()) throw new BadRequestException("Column '" + col + "' is required");
        return v;
    }

    private String getCsvStr(String[] cols, Map<String, Integer> idx, String col) {
        Integer i = idx.get(col);
        if (i == null || i >= cols.length) return "";
        return cols[i].trim();
    }

    private String requireCsvStr(String[] cols, Map<String, Integer> idx, String col) {
        String v = getCsvStr(cols, idx, col);
        if (v.isBlank()) throw new BadRequestException("Column '" + col + "' is required");
        return v;
    }

    private BigDecimal parseBD(String s) {
        try { return new BigDecimal(s.replaceAll("[^0-9.]", "")); }
        catch (Exception e) { throw new BadRequestException("Invalid number: " + s); }
    }

    private int parseIntSafe(String s, int defaultVal) {
        try { return s == null || s.isBlank() ? defaultVal : Integer.parseInt(s.replaceAll("[^0-9]", "")); }
        catch (Exception e) { return defaultVal; }
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}
