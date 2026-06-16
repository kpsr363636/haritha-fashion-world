package com.harithafashion.util;

public final class PincodeValidator {

    private PincodeValidator() {}

    public static boolean isValid(String pincode) {
        return pincode != null && pincode.matches("^[1-9][0-9]{5}$");
    }
}
