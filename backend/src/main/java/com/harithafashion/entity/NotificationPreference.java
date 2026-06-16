package com.harithafashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "order_updates_email")
    @Builder.Default
    private Boolean orderUpdatesEmail = true;

    @Column(name = "order_updates_sms")
    @Builder.Default
    private Boolean orderUpdatesSms = true;

    @Column(name = "order_updates_whatsapp")
    @Builder.Default
    private Boolean orderUpdatesWhatsapp = true;

    @Column(name = "sale_alerts_email")
    @Builder.Default
    private Boolean saleAlertsEmail = true;

    @Column(name = "sale_alerts_sms")
    @Builder.Default
    private Boolean saleAlertsSms = false;

    @Column(name = "new_arrivals_email")
    @Builder.Default
    private Boolean newArrivalsEmail = true;

    @Column(name = "price_drop_email")
    @Builder.Default
    private Boolean priceDropEmail = true;

    @Column(name = "back_in_stock_email")
    @Builder.Default
    private Boolean backInStockEmail = true;
}
