// Main exports
export { KafkaProducer } from './KafkaProducer';
export { KafkaConsumer } from './KafkaConsumer';
export { KAFKA_TOPICS, TOPIC_CONFIGS } from './topics';

// Export all event schemas and types
export * from './events/schemas';

// Export types
export type { KafkaProducerConfig, PublishOptions } from './KafkaProducer';
export type { KafkaConsumerConfig, MessageHandler, MessageContext, DeadLetterQueueConfig } from './KafkaConsumer';
export type { KafkaTopic, TopicConfig } from './topics';
