package com.harithafashion.service;

import com.harithafashion.entity.Product;
import com.harithafashion.entity.ProductImage;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class GoogleShoppingFeedService {

    private final ProductRepository productRepository;

    @Value("${app.frontend-url:https://www.harithafashion.com}")
    private String frontendUrl;

    public String generateFeed() {
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
                  <channel>
                    <title>Haritha Fashion World</title>
                    <link>""" + frontendUrl + """
                </link>
                    <description>Women's ethnic fashion, sarees, jewellery and accessories</description>
                """);

        productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(0, 5000)).forEach(p -> {
            String imageUrl = p.getImages() != null && !p.getImages().isEmpty()
                    ? p.getImages().stream().filter(i -> Boolean.TRUE.equals(i.getIsPrimary()))
                        .findFirst().map(ProductImage::getImageUrl)
                        .orElse(p.getImages().get(0).getImageUrl())
                    : "";

            String availability = p.getVariants() != null && p.getVariants().stream()
                    .anyMatch(v -> Boolean.TRUE.equals(v.getIsActive()) && v.getStockQuantity() > 0)
                    ? "in stock" : "out of stock";

            String condition = "new";
            String brand = p.getSeller() != null && p.getSeller().getBusinessName() != null
                    ? p.getSeller().getBusinessName() : "Haritha Fashion";
            String category = p.getCategory() != null ? p.getCategory().getName() : "Apparel & Accessories";

            xml.append("    <item>\n");
            xml.append("      <g:id>").append(p.getId()).append("</g:id>\n");
            xml.append("      <g:title>").append(esc(p.getName())).append("</g:title>\n");
            xml.append("      <g:description>").append(esc(truncate(p.getDescription(), 500))).append("</g:description>\n");
            xml.append("      <g:link>").append(frontendUrl).append("/products/").append(p.getSlug()).append("</g:link>\n");
            xml.append("      <g:image_link>").append(esc(imageUrl)).append("</g:image_link>\n");
            xml.append("      <g:price>").append(p.getMrp()).append(" INR</g:price>\n");
            if (p.getBasePrice() != null && p.getMrp() != null
                    && p.getBasePrice().compareTo(p.getMrp()) < 0) {
                xml.append("      <g:sale_price>").append(p.getBasePrice()).append(" INR</g:sale_price>\n");
            }
            xml.append("      <g:availability>").append(availability).append("</g:availability>\n");
            xml.append("      <g:condition>").append(condition).append("</g:condition>\n");
            xml.append("      <g:brand>").append(esc(brand)).append("</g:brand>\n");
            xml.append("      <g:google_product_category>").append(mapCategory(category)).append("</g:google_product_category>\n");
            if (p.getHsnCode() != null) {
                xml.append("      <g:gtin>").append(p.getHsnCode()).append("</g:gtin>\n");
            }
            xml.append("      <g:identifier_exists>no</g:identifier_exists>\n");
            xml.append("      <g:shipping>\n");
            xml.append("        <g:country>IN</g:country>\n");
            xml.append("        <g:price>0 INR</g:price>\n");
            xml.append("      </g:shipping>\n");
            if (p.getFabric() != null) {
                xml.append("      <g:material>").append(esc(p.getFabric())).append("</g:material>\n");
            }
            xml.append("    </item>\n");
        });

        xml.append("  </channel>\n</rss>");
        return xml.toString();
    }

    private String mapCategory(String name) {
        if (name == null) return "Apparel & Accessories";
        return switch (name.toLowerCase()) {
            case "sarees" -> "Apparel & Accessories > Clothing > Dresses";
            case "ethnic wear" -> "Apparel & Accessories > Clothing > Traditional Wear";
            case "jewellery", "fine jewellery" -> "Apparel & Accessories > Jewelry";
            case "bags", "handbags" -> "Apparel & Accessories > Handbags, Wallets & Cases > Handbags";
            case "footwear" -> "Apparel & Accessories > Shoes";
            case "beauty", "skincare" -> "Health & Beauty > Beauty";
            default -> "Apparel & Accessories";
        };
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "...";
    }
}
