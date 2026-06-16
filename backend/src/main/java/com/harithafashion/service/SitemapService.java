package com.harithafashion.service;

import com.harithafashion.entity.Product;
import com.harithafashion.entity.enums.ProductStatus;
import com.harithafashion.repository.CategoryRepository;
import com.harithafashion.repository.LegalPageRepository;
import com.harithafashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final LegalPageRepository legalPageRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String CACHE_KEY = "sitemap:xml";

    public String generateSitemap() {
        String cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached != null) return cached;

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        addUrl(xml, "https://www.harithafashion.com/", "1.0", "daily");
        categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc().forEach(c ->
                addUrl(xml, "https://www.harithafashion.com/products?category=" + c.getSlug(), "0.8", "weekly"));
        productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(0, 5000)).forEach(p ->
                addUrl(xml, "https://www.harithafashion.com/products/" + p.getSlug(), "0.7", "weekly"));
        legalPageRepository.findAll().forEach(l ->
                addUrl(xml, "https://www.harithafashion.com/legal/" + l.getSlug(), "0.3", "monthly"));
        xml.append("</urlset>");
        String result = xml.toString();
        redisTemplate.opsForValue().set(CACHE_KEY, result, 1, TimeUnit.HOURS);
        return result;
    }

    private void addUrl(StringBuilder xml, String loc, String priority, String freq) {
        xml.append("  <url><loc>").append(loc).append("</loc>");
        xml.append("<lastmod>").append(LocalDate.now()).append("</lastmod>");
        xml.append("<changefreq>").append(freq).append("</changefreq>");
        xml.append("<priority>").append(priority).append("</priority></url>\n");
    }
}
