package com.distributepipeline.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import com.distributepipeline.domain.Trigger;
import com.distributepipeline.domain.WorkFlow;

@Configuration
@EnableKafka
public class JobManagerProducerConfig {

	//kafka producer bean having string as key and trigger object as value
	 @Bean
	    public ProducerFactory<String, Trigger> producerFactory() {
	        Map<String, Object> configProps = new HashMap<>();
	        configProps.put(
	          ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, 
	          "172.23.238.158:9092");
	        configProps.put(
	          ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
	          StringSerializer.class);
	        configProps.put(
	          ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
	          JsonSerializer.class);
	        
	        return new DefaultKafkaProducerFactory<>(configProps);
	    }
	 
	    @Bean
	    public KafkaTemplate<String, Trigger> kafkaReportTemplate() {
	        return new KafkaTemplate<>(producerFactory());
	    }
	  
	    
	    // kafka producer bean having string as key and value
	    @Bean
	    public ProducerFactory<String, String> producerStringFactory() {
	        Map<String, Object> configProps = new HashMap<>();
	        configProps.put(
	          ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, 
	          "172.23.238.158:9092");
	        configProps.put(
	          ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
	          StringSerializer.class);
	        configProps.put(
	          ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
	          StringSerializer.class);
	        
	        return new DefaultKafkaProducerFactory<>(configProps);
	    }
	 
	    @Bean
	    public KafkaTemplate<String, String> kafkaStringTemplate() {
	        return new KafkaTemplate<>(producerStringFactory());
	    }
	
	    
	   
}