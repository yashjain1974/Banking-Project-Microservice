package com.notification.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import com.notification.event.KycStatusUpdatedEvent;
import com.notification.event.LoanStatusUpdatedEvent;
import com.notification.event.TransactionCompletedEvent;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    // ✅ Generic method to build a ConsumerFactory for any type
    private <T> ConsumerFactory<String, T> buildConsumerFactory(Class<T> targetType) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class.getName());
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, targetType.getName());
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        return new DefaultKafkaConsumerFactory<>(props);
    }

    // ✅ Factory for TransactionCompletedEvent
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TransactionCompletedEvent> transactionKafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, TransactionCompletedEvent>();
        factory.setConsumerFactory(buildConsumerFactory(TransactionCompletedEvent.class));
        return factory;
    }

    // ✅ Factory for LoanStatusUpdatedEvent
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, LoanStatusUpdatedEvent> loanKafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, LoanStatusUpdatedEvent>();
        factory.setConsumerFactory(buildConsumerFactory(LoanStatusUpdatedEvent.class));
        return factory;
    }

    // ✅ Factory for KycStatusUpdatedEvent
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, KycStatusUpdatedEvent> kycKafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, KycStatusUpdatedEvent>();
        factory.setConsumerFactory(buildConsumerFactory(KycStatusUpdatedEvent.class));
        return factory;
    }
}