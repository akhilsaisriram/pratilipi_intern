const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const orderroutes=require("./routes/order_routs");
const RabbitMQService = require('./config/rabbitmq'); 
require('./scheduler/cronjob')
const {orderconsumer}=require('./consumer/rabbitmq_consumer')
const connectdb = require('./config/db');

connectdb();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 


app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello order' });
});

app.use('/order',orderroutes);


orderconsumer();

async function initializeApp() {
  try {
    // Connect to RabbitMQ
    await RabbitMQService.connect();
    console.log('RabbitMQ service initialized successfully');

    // await orderconsumer();
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await RabbitMQService.closeConnection();
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

initializeApp();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
