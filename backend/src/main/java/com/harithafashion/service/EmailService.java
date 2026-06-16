package com.harithafashion.service;

import com.harithafashion.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${aws.ses.from-email}")
    private String fromEmail;

    @Value("${aws.ses.from-name}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(User user) {
        Context ctx = ctx("name", user.getName() != null ? user.getName() : "there");
        send(user.getEmail(), "Welcome to Haritha Fashion World", "welcome", ctx);
    }

    @Async
    public void sendOrderConfirmedEmail(String email, String name, String orderNumber, String total) {
        Context ctx = ctx("name", name, "orderNumber", orderNumber, "total", total);
        send(email, "Order Confirmed - " + orderNumber, "order-confirmed", ctx);
    }

    @Async
    public void sendAbandonedCartEmail(String email, String name) {
        Context ctx = ctx("name", name, "cartUrl", frontendUrl + "/cart");
        send(email, "You left something behind!", "abandoned-cart", ctx);
    }

    @Async
    public void sendPasswordResetEmail(String email, String name, String token) {
        Context ctx = ctx("name", name, "resetUrl", frontendUrl + "/reset-password?token=" + token);
        send(email, "Reset your password", "password-reset", ctx);
    }

    @Async
    public void sendPriceDropEmail(String email, String name, String productName, String price) {
        Context ctx = ctx("name", name, "productName", productName, "price", price);
        send(email, "Price drop on your wishlist item", "price-drop", ctx);
    }

    @Async
    public void sendBackInStockEmail(String email, String name, String productName) {
        Context ctx = ctx("name", name, "productName", productName, "shopUrl", frontendUrl + "/products");
        send(email, productName + " is back in stock!", "back-in-stock", ctx);
    }

    @Async
    public void sendReturnInitiatedEmail(String email, String name, String orderNumber) {
        Context ctx = ctx("name", name, "orderNumber", orderNumber);
        send(email, "Return request received", "return-initiated", ctx);
    }

    @Async
    public void sendReturnRefundedEmail(String email, String name, String amount) {
        Context ctx = ctx("name", name, "amount", amount);
        send(email, "Refund processed", "return-refunded", ctx);
    }

    @Async
    public void sendSellerPayoutEmail(String email, String name, BigDecimal amount) {
        Context ctx = ctx("name", name, "amount", amount.toString());
        send(email, "Payout processed", "seller-payout", ctx);
    }

    @Async
    public void sendSellerStatusEmail(String email, String name, String status) {
        Context ctx = ctx("name", name, "status", status);
        send(email, "Seller application " + status.toLowerCase(), "seller-approved", ctx);
    }

    @Async
    public void sendReferralCreditedEmail(String email, String name, int points) {
        Context ctx = ctx("name", name, "points", String.valueOf(points));
        send(email, "Referral reward credited", "referral-credited", ctx);
    }

    @Async
    public void sendShippingUpdateEmail(String email, String name, String orderNumber, String trackingId) {
        Context ctx = ctx("name", name, "orderNumber", orderNumber, "trackingId", trackingId);
        send(email, "Your order has shipped", "order-shipped", ctx);
    }

    private Context ctx(Object... kv) {
        Context c = new Context();
        for (int i = 0; i < kv.length; i += 2) {
            c.setVariable((String) kv[i], kv[i + 1]);
        }
        return c;
    }

    private void send(String to, String subject, String template, Context context) {
        if (to == null || to.isBlank()) return;
        try {
            String html = templateEngine.process("email/" + template, context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", to, e.getMessage());
        }
    }
}
