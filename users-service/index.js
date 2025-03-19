const express = require('express');
const cors = require('cors');
const connectdb = require('./config/db');
const morgan = require('morgan');
const app = express();
const user_route=require('./routes/usersroute')
app.use(cors());
app.use(express.json());
const RabbitMQService=require('./config/rabbitmq');
const startConsumer=require('./consumer/consumer')
app.use(morgan('dev')); 
connectdb();

app.use('/users', user_route);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello' });
});
startConsumer();
async function initializeApp() {
  try {
    await RabbitMQService.connect();
    console.log('RabbitMQ service initialized successfully user');
    // await startConsumer();
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await RabbitMQService.closeConnection();
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

initializeApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
