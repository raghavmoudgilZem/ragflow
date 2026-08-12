package com.rag.identity_service;

import com.rag.identity_service.service.TenantRoleService;
import com.rag.identity_service.service.UserService;
import com.rag.identity_service.util.RoleSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
		"security.secret=your_local_256_bit_secret_key_here",
		"security.role-claim-key=http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
		"security.excluded-paths=/v1/user/register,/v1/user/login,/swagger-ui/**,/swagger-ui.html,/v3/api-docs/**,/actuator/health",

		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration," +
				"org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration," +
				"org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
class IdentityServiceApplicationTests {

	@MockitoBean
	private UserService userService;

	@MockitoBean
	private TenantRoleService tenantRoleService;

	@MockitoBean
	private RoleSeeder roleSeeder;

	@Test
	void contextLoads() {
	}
}