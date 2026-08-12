package org.zemoso.utils;

public class HelperUtils {

    private HelperUtils() {
    }

    public static void sleepForAWhile(int timer) {
        try {
            Thread.sleep(timer);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
