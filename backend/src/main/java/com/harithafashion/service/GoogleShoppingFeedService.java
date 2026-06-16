package com.harithafashion.service;

import com.harithafashion.entity.Product;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoogleShoppingFeedService {

    private final ProductRepository productRepository;

    public String generateFeed() {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\"?><rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\"><channel>");
        xml.append("<title>Haritha Fashion World</title>");
        productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(0, 5000)).forEach(p -> {
            xml.append("<item>");
            xml.append("<g:id>").append(p.getId()).append("</g:id>");
            xml.append("<g:title>").append(escape(p.getName())).append("</g:title>");
            xml.append("<g:link>https://www.harithafashion.com/products/").append(p.getSlug()).append("</g:link>");
            xml.append("<g:price>").append(p.getBasePrice()).append(" INR</g:price>");
            xml.append("<g:availability>in stock</g:availability>");
            xml.append("</item>");
        });
        xml.append("</channel></rss>");
        return xml.toString();
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;");
    }
}
