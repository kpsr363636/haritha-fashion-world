package com.harithafashion.service;

import com.harithafashion.entity.Order;
import com.harithafashion.util.GstCalculator;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    public byte[] generateInvoicePdf(Order order) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.add(new Paragraph("Haritha Fashion World — Tax Invoice").setBold().setFontSize(16));
            doc.add(new Paragraph("Order: " + order.getOrderNumber()));
            doc.add(new Paragraph("Date: " + order.getPlacedAt()));
            if (order.getAddressSnapshot() != null) {
                doc.add(new Paragraph("Ship To: " + order.getAddressSnapshot().get("fullName")));
                doc.add(new Paragraph(String.valueOf(order.getAddressSnapshot().get("addressLine"))));
            }
            Table table = new Table(4);
            table.addCell("Item"); table.addCell("Qty"); table.addCell("Price"); table.addCell("Total");
            order.getItems().forEach(item -> {
                table.addCell(item.getProductName());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell("₹" + item.getUnitPrice());
                table.addCell("₹" + item.getTotalPrice());
            });
            doc.add(table);
            BigDecimal cgst = GstCalculator.splitCgst(order.getGstAmount());
            doc.add(new Paragraph("Subtotal: ₹" + order.getSubtotal()));
            doc.add(new Paragraph("CGST: ₹" + cgst + " | SGST: ₹" + GstCalculator.splitSgst(order.getGstAmount())));
            doc.add(new Paragraph("Delivery: ₹" + order.getDeliveryCharge()));
            doc.add(new Paragraph("Total: ₹" + order.getTotalAmount()).setBold());
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Invoice generation failed", e);
        }
        return baos.toByteArray();
    }
}
