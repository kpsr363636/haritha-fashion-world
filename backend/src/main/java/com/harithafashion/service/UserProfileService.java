package com.harithafashion.service;

import com.harithafashion.entity.LoyaltyTransaction;
import com.harithafashion.entity.NotificationPreference;
import com.harithafashion.entity.User;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.LoyaltyTransactionRepository;
import com.harithafashion.repository.NotificationPreferenceRepository;
import com.harithafashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final NotificationPreferenceRepository notificationPreferenceRepository;

    public NotificationPreference getNotificationPreferences(UUID userId) {
        return notificationPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found"));
    }

    @Transactional
    public NotificationPreference updateNotificationPreferences(UUID userId, NotificationPreference prefs) {
        NotificationPreference existing = getNotificationPreferences(userId);
        if (prefs.getOrderUpdatesEmail() != null) existing.setOrderUpdatesEmail(prefs.getOrderUpdatesEmail());
        if (prefs.getOrderUpdatesSms() != null) existing.setOrderUpdatesSms(prefs.getOrderUpdatesSms());
        if (prefs.getOrderUpdatesWhatsapp() != null) existing.setOrderUpdatesWhatsapp(prefs.getOrderUpdatesWhatsapp());
        if (prefs.getSaleAlertsEmail() != null) existing.setSaleAlertsEmail(prefs.getSaleAlertsEmail());
        if (prefs.getSaleAlertsSms() != null) existing.setSaleAlertsSms(prefs.getSaleAlertsSms());
        if (prefs.getNewArrivalsEmail() != null) existing.setNewArrivalsEmail(prefs.getNewArrivalsEmail());
        if (prefs.getPriceDropEmail() != null) existing.setPriceDropEmail(prefs.getPriceDropEmail());
        if (prefs.getBackInStockEmail() != null) existing.setBackInStockEmail(prefs.getBackInStockEmail());
        return notificationPreferenceRepository.save(existing);
    }
}
