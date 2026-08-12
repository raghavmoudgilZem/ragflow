package com.ragflow.file.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;

import static org.assertj.core.api.Assertions.assertThat;

class CommonConstantsTest {

    @Test
    @DisplayName("Should contain correct constant values")
    void testConstantValues() {
        assertThat(CommonConstants.BASE_URL).isEqualTo("api/v1/file");
        assertThat(CommonConstants.KNOWLEDGEBASE_FOLDER).isEqualTo(".knowledgebase");
    }

    @Test
    @DisplayName("Should have a private constructor and support reflection instantiation for 100% coverage")
    void testPrivateConstructor() throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        Constructor<CommonConstants> constructor = CommonConstants.class.getDeclaredConstructor();

        // Verify the constructor is private
        assertThat(Modifier.isPrivate(constructor.getModifiers())).isTrue();

        // Make constructor accessible and instantiate
        constructor.setAccessible(true);
        CommonConstants instance = constructor.newInstance();

        assertThat(instance).isNotNull();
    }
}