package com.transaction.proxyService;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.transaction.dto.NotificationRequestDto;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

// @FeignClient annotation specifies the name of the target service (as registered in Eureka)
// The name "notification-service" should match the 'spring.application.name' in the Notification Service's application.yml
@FeignClient(name = "notification-service", path = "/notifications")
public interface NotificationServiceClient {

    /**
     * Sends an email notification via the Notification Service.
     * Corresponds to POST /notifications/send-email
     * @param requestDto The NotificationRequestDto containing user ID, type (EMAIL), and content.
     */
	@PostMapping("/send-email")
    @Retry(name = "notificationService") // Retry sending email
    @CircuitBreaker(name = "notificationService", fallbackMethod = "sendEmailNotificationFallback") // Circuit breaker for notification service
    void sendEmailNotification(@RequestBody NotificationRequestDto requestDto);

	default void sendEmailNotificationFallback(NotificationRequestDto requestDto, Throwable t) {
        System.err.println("Fallback for sendEmailNotification: " + t.getMessage());
        // For notifications, often you just log and don't re-throw, as it's a best-effort delivery.
        // This prevents the main transaction from failing if notification service is down.
    }
	
    /**
     * Sends an SMS notification via the Notification Service.
     * Corresponds to POST /notifications/send-sms
     * @param requestDto The NotificationRequestDto containing user ID, type (SMS), and content.
     */
    @PostMapping("/send-sms")
    void sendSmsNotification(@RequestBody NotificationRequestDto requestDto);
}
