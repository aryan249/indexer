import { Kafka, logLevel } from "kafkajs";
import { config } from "../config/config";

export const kafka = new Kafka({
  clientId: config.KAFKA_CLIENT_ID,
  brokers: config.KAFKA_BROKERS,
  logLevel: logLevel.INFO,
});

export function createBlockProducer() {
  return kafka.producer();
}

export function createBlockConsumer(groupId: string) {
  return kafka.consumer({ groupId });
}

