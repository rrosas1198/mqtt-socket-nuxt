export type IMqttConsumerHandler<T> = (message: T) => void | Promise<void>;
