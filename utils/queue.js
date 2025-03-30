const amqp = require('amqplib');
const config = require('config');

async function connectQueue() {
  const connection = await amqp.connect(config.get('rabbitmq').url);
  const channel = await connection.createChannel();
  return channel;
}

module.exports = {
  connectQueue,
  sendToQueue: async (queue, message) => {
    const channel = await connectQueue();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  },
};