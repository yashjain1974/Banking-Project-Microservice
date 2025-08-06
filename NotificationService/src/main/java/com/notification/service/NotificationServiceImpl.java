package com.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.notification.dao.NotificationRepository;
import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.dto.UserDto;
import com.notification.event.KycStatusUpdatedEvent; // Import local event DTO
import com.notification.event.LoanStatusUpdatedEvent; // Import local event DTO
import com.notification.event.TransactionCompletedEvent;
import com.notification.exceptions.NotificationProcessingException;
import com.notification.model.Notification;
import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;
import com.notification.proxyService.UserServiceClient;

import jakarta.annotation.PostConstruct;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final UserServiceClient userServiceClient;

    @Value("${keycloak.service-client.url}")
    private String keycloakServiceClientUrl;
    @Value("${keycloak.service-client.realm}")
    private String keycloakServiceClientRealm;
    @Value("${keycloak.service-client.client-id}")
    private String keycloakServiceClientClientId;
    @Value("${keycloak.service-client.client-secret}")
    private String keycloakServiceClientClientSecret;

    private String serviceAccessToken;

    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository, JavaMailSender mailSender, UserServiceClient userServiceClient) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
        this.userServiceClient = userServiceClient;
    }

    @PostConstruct
    public void init() {
        this.refreshServiceAccessToken();
    }

    @Scheduled(fixedRate = 300000)
    public void refreshServiceAccessToken() {
        try {
            AccessTokenResponse tokenResponse = KeycloakBuilder.builder()
                .serverUrl(keycloakServiceClientUrl)
                .realm(keycloakServiceClientRealm)
                .clientId(keycloakServiceClientClientId)
                .clientSecret(keycloakServiceClientClientSecret)
                .grantType("client_credentials")
                .build()
                .tokenManager()
                .getAccessToken();
            
            this.serviceAccessToken = tokenResponse.getToken();
            System.out.println("Notification Service: Successfully refreshed service-to-service token.");
        } catch (Exception e) {
            System.err.println("Notification Service: Failed to refresh service-to-service token: " + e.getMessage());
            this.serviceAccessToken = null;
        }
    }

    @KafkaListener(
    	    topics = "transaction-events",
    	    groupId = "notification-service-group",
    	    containerFactory = "transactionKafkaListenerContainerFactory"
    	)
    public void listenTransactionEvents(TransactionCompletedEvent event) { // Use local event DTO
        System.out.println("Notification Service: Received transaction event from Kafka: " + event.getTransactionId());

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setUserId(event.getUserId());
        notificationRequest.setContent(event.getNotificationMessage());
        notificationRequest.setType(NotificationType.EMAIL);

        try {
            sendNotificationInternal(notificationRequest);
            System.out.println("Notification sent for transaction: " + event.getTransactionId());
        } catch (Exception e) {
            System.err.println("Error processing Kafka event for transaction " + event.getTransactionId() + ": " + e.getMessage());
        }
    }

    /**
     * NEW KAFKA LISTENER: Consumes KYC status update events.
     */
    @KafkaListener(
    	    topics = "kyc-status-events",
    	    groupId = "notification-service-group",
    	    containerFactory = "kycKafkaListenerContainerFactory"
    	)
    public void listenKycStatusEvents(KycStatusUpdatedEvent event) { // Use local event DTO
        System.out.println("Notification Service: Received KYC status event from Kafka: User=" + event.getUserId() + ", New Status=" + event.getNewKycStatus());

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setUserId(event.getUserId());
        notificationRequest.setContent(event.getMessage());
        notificationRequest.setType(NotificationType.EMAIL);

        try {
            sendNotificationInternal(notificationRequest);
            System.out.println("KYC notification sent for user: " + event.getUserId());
        } catch (Exception e) {
            System.err.println("Error processing KYC event for user " + event.getUserId() + ": " + e.getMessage());
        }
    }

    /**
     * NEW KAFKA LISTENER: Consumes Loan status update events.
     */
    @KafkaListener(
    	    topics = "loan-status-events",
    	    groupId = "notification-service-group",
    	    containerFactory = "loanKafkaListenerContainerFactory"
    	)
    public void listenLoanStatusEvents(LoanStatusUpdatedEvent event) { // Use local event DTO
        System.out.println("Notification Service: Received Loan status event from Kafka: Loan=" + event.getLoanId() + ", New Status=" + event.getNewStatus());

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setUserId(event.getUserId());
        notificationRequest.setContent(event.getMessage());
        notificationRequest.setType(NotificationType.EMAIL);

        try {
            sendNotificationInternal(notificationRequest);
            System.out.println("Loan status notification sent for loan: " + event.getLoanId());
        } catch (Exception e) {
            System.err.println("Error processing Loan event for loan " + event.getLoanId() + ": " + e.getMessage());
        }
    }

    @Transactional
    private NotificationResponse sendNotificationInternal(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setContent(request.getContent());
        notification.setSentAt(LocalDateTime.now());
        notification.setStatus(NotificationStatus.PENDING);

        NotificationResponse response = new NotificationResponse();
        response.setUserId(request.getUserId());
        response.setType(request.getType());
        response.setContent(request.getContent());
        response.setSentAt(notification.getSentAt());

        try {
            String recipientEmail = null;

            if (request.getUserId() != null) {
                UserDto userProfile = userServiceClient.getUserById(request.getUserId(), "Bearer " + serviceAccessToken);
                if (userProfile != null && userProfile.getEmail() != null) {
                    recipientEmail = userProfile.getEmail();
                } else {
                    System.err.println("User profile or email not found for userId: " + request.getUserId() + ". Cannot send email.");
                    throw new NotificationProcessingException("User email not found for notification.");
                }
            } else {
                System.err.println("User ID is null. Cannot send email notification.");
                throw new NotificationProcessingException("User ID is missing for notification.");
            }

            if (request.getType() == NotificationType.EMAIL) {
                sendEmail(recipientEmail, "Banking Alert: " + request.getType().name() + " Update", request.getContent());
            } else if (request.getType() == NotificationType.SMS) {
                System.out.println("SMS sending is not implemented yet. Content: " + request.getContent());
            }

            notification.setStatus(NotificationStatus.SENT);
            notification = notificationRepository.save(notification);

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.SENT);
            response.setMessage("Notification sent successfully.");

        } catch (MailException e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification = notificationRepository.save(notification);

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.FAILED);
            response.setMessage("Failed to send email: " + e.getMessage());
            System.err.println("Email sending failed for user " + request.getUserId() + ": " + e.getMessage());
            throw new NotificationProcessingException("Failed to send email notification.", e);
        } catch (NotificationProcessingException e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification = notificationRepository.save(notification);
            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.FAILED);
            response.setMessage(e.getMessage());
            System.err.println("Notification processing failed for user " + request.getUserId() + ": " + e.getMessage());
            throw e;
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification = notificationRepository.save(notification);

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.FAILED);
            response.setMessage("Failed to send notification: " + e.getMessage());
            System.err.println("Notification processing failed for user " + request.getUserId() + ": " + e.getMessage());
            throw new NotificationProcessingException("Failed to send notification via external provider.", e);
        }
        return response;
    }

    private void sendEmail(String toEmail, String subject, String content) throws Exception {
        System.out.println("Attempting to send EMAIL to " + toEmail + " with subject: " + subject + ", content: " + content);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmailAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);
        
        mailSender.send(message);
        System.out.println("Email sent via Gmail SMTP successfully to " + toEmail);
    }

    @Override
    public NotificationResponse sendNotification(NotificationRequest request) {
        return sendNotificationInternal(request);
    }

    @Override
    public Optional<Notification> getNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId);
    }

    @Override
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public List<Notification> getNotificationsByTypeAndStatus(NotificationType type, NotificationStatus status) {
        return notificationRepository.findByTypeAndStatus(type, status);
    }
}