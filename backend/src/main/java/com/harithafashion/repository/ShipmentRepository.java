package com.harithafashion.repository;

import com.harithafashion.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    List<Shipment> findByOrderId(UUID orderId);

    Optional<Shipment> findByOrderItemId(UUID orderItemId);

    Optional<Shipment> findByAwbNumber(String awbNumber);

    Optional<Shipment> findByShiprocketShipmentId(String shiprocketShipmentId);

    Optional<Shipment> findByShiprocketOrderId(String shiprocketOrderId);

    List<Shipment> findByOrderIdAndStatus(UUID orderId, String status);
}
