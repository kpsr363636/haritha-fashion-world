package com.harithafashion.exception;

public class OutOfStockException extends RuntimeException {

    public OutOfStockException(String message) {
        super(message);
    }

    public OutOfStockException(String productName, String size) {
        super(String.format("Product '%s' in size '%s' is out of stock", productName, size));
    }
}
