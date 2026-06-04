import os
import logging
from faststream.rabbit import RabbitBroker

logger = logging.getLogger(__name__)

# Use AMQP URL from env or default to localhost
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

# Create a globally accessible RabbitBroker instance
broker = RabbitBroker(RABBITMQ_URL)
