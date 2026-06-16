package com.harithafashion.service;

import com.harithafashion.dto.request.AddressRequest;
import com.harithafashion.dto.response.AddressResponse;
import com.harithafashion.entity.Address;
import com.harithafashion.entity.User;
import com.harithafashion.exception.ResourceNotFoundException;
import com.harithafashion.repository.AddressRepository;
import com.harithafashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getUserAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Transactional
    public AddressResponse create(UUID userId, AddressRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (Boolean.TRUE.equals(req.getIsDefault())) clearDefault(userId);
        return AddressResponse.from(addressRepository.save(toEntity(user, req, null)));
    }

    @Transactional
    public AddressResponse update(UUID userId, UUID id, AddressRequest req) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (Boolean.TRUE.equals(req.getIsDefault())) clearDefault(userId);
        address.setLabel(req.getLabel());
        address.setFullName(req.getFullName());
        address.setMobile(req.getMobile());
        address.setAddressLine(req.getAddressLine());
        address.setLandmark(req.getLandmark());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPincode(req.getPincode());
        address.setIsDefault(req.getIsDefault());
        return AddressResponse.from(addressRepository.save(address));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse setDefault(UUID userId, UUID id) {
        clearDefault(userId);
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        address.setIsDefault(true);
        return AddressResponse.from(addressRepository.save(address));
    }

    private void clearDefault(UUID userId) {
        addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).forEach(a -> {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        });
    }

    private Address toEntity(User user, AddressRequest req, Address existing) {
        return Address.builder()
                .user(user).label(req.getLabel()).fullName(req.getFullName())
                .mobile(req.getMobile()).addressLine(req.getAddressLine())
                .landmark(req.getLandmark()).city(req.getCity()).state(req.getState())
                .pincode(req.getPincode()).isDefault(req.getIsDefault()).build();
    }
}
