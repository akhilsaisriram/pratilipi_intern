const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const notificationRoutes=require("./routes/notification_route");
const startConsumer = require('./consumer/rabbitmq_consumer'); 

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 
const rabbitMQService = require('./config/rabbitmq'); 

const connectdb = require('./config/db');
connectdb();
app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello' });
});

app.use('/notification', notificationRoutes);
startConsumer();
async function initializeApp() {
  while (true) {
    try {
      await rabbitMQService.connect();
      console.log('RabbitMQ service initialized successfully in notification');
      // await startConsumer();
      break;
    } catch (error) {
      console.error('Failed to initialize RabbitMQ, retrying in 5s...', error.message);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await rabbitMQService.closeConnection();
    process.exit(0);
  });
}

initializeApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
