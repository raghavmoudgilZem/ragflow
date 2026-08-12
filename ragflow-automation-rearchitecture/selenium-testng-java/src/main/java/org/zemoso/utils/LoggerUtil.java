package org.zemoso.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.function.BiConsumer;

public class LoggerUtil {

    public static void info(String message, Object... params) {
        log((logger, msg) -> logger.info(msg, params), message);
    }

    public static void error(String message, Object... params) {
        log((logger, msg) -> logger.error(msg, params), message);
    }

    private static void log(BiConsumer<Logger, String> logMethod,
                            String message) {

        StackTraceElement caller = getCallerStackTrace();

        Logger logger = LoggerFactory.getLogger(caller.getClassName());

        String msgWithLocation = String.format(
                "%s(%d) - %s",
                caller.getMethodName(),
                caller.getLineNumber(),
                message
        );

        logMethod.accept(logger, msgWithLocation);
    }


    private static StackTraceElement getCallerStackTrace() {
        StackTraceElement[] stack = Thread.currentThread().getStackTrace();
        for (StackTraceElement elem : stack) {
            String className = elem.getClassName();
            // skip LoggerUtil and internal framework classes
            if (!className.equals(LoggerUtil.class.getName()) &&
                    !className.startsWith("java.lang.Thread") &&
                    !className.startsWith("org.testng")) {
                return elem;
            }
        }
        return stack[stack.length - 1];
    }

}
