package com.harithafashion.controller;

import com.harithafashion.service.GoogleShoppingFeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final GoogleShoppingFeedService feedService;

    @GetMapping(value = "/google-shopping.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String googleShoppingFeed() {
        return feedService.generateFeed();
    }
}
