package com.interim.server;

import java.time.LocalDateTime;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.interim.server.enums.Role;
import com.interim.server.models.User;
import com.interim.server.repositories.UserRepository;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@Bean
	CommandLineRunner seedUsers(UserRepository userRepository) {
		return args -> {
			if (userRepository.count() > 0) {
				return;
			}

			LocalDateTime now = LocalDateTime.now();

			User employee = User.builder()
					.employeeId(1001)
					.email("employee@company.com")
					.password(BCrypt.hashpw("password123", BCrypt.gensalt()))
					.fullName("John Employee")
					.phone("0712345678")
					.role(Role.EMPLOYEE)
					.createdAt(now)
					.isActive(true)
					.build();

			User vendor = User.builder()
					.employeeId(1002)
					.email("vendor@company.com")
					.password(BCrypt.hashpw("password123", BCrypt.gensalt()))
					.fullName("Jane Vendor")
					.phone("0723456789")
					.role(Role.VENDOR)
					.createdAt(now)
					.isActive(true)
					.build();

			User admin = User.builder()
					.employeeId(1003)
					.email("admin@company.com")
					.password(BCrypt.hashpw("password123", BCrypt.gensalt()))
					.fullName("Alice Admin")
					.phone("0734567890")
					.role(Role.ADMIN)
					.createdAt(now)
					.isActive(true)
					.build();

			userRepository.saveAll(List.of(employee, vendor, admin));
			System.out.println("Seeded database with 3 test users.");
		};
	}

}
