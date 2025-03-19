const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      // Implement retry logic or throw error as needed
      setTimeout(() => this.connect(), 5000);
    }
  }


  async sendtoqueue(queue, message) {
    try {
      if (!this.channel) await this.connect();
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log(`Message sent to queue: ${queue}`);
    } catch (error) {
      console.error('Error sending message to queue:', error);
      throw error;
    }
  }


  async closeConnection() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

module.exports = new RabbitMQService();
