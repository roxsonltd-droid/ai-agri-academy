from faststream import RabbitBroker, Depends, Path
from faststream.rabbit import RabbitRouter
from core.graph import Neo4jDriver
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Define a FastStream router for collective intelligence events
collective_router = RabbitRouter("collective_intelligence")

# Expected payload structures (simplified)
# farm_report: {"farmer_id": int, "region": str, "symptoms": [str], "ndvi": float, "timestamp": str}
# sensor_reading: {"sensor_id": str, "region": str, "type": str, "value": float, "timestamp": str}

@collective_router.subscriber("farm_reports")
async def handle_farm_report(message: dict):
    try:
        logger.info("CIE: Received farm_report %s", message)
        driver = Neo4jDriver()
        # Create / merge FarmReport node and link to Region
        query = """
        MERGE (r:Region {name: $region})
        CREATE (fr:FarmReport {
            farmer_id: $farmer_id,
            symptoms: $symptoms,
            ndvi: $ndvi,
            timestamp: datetime($timestamp)
        })
        MERGE (r)-[:HAS_REPORT]->(fr)
        RETURN id(fr) AS report_id
        """
        driver.run(query, {
            "region": message.get("region"),
            "farmer_id": message.get("farmer_id"),
            "symptoms": message.get("symptoms", []),
            "ndvi": message.get("ndvi"),
            "timestamp": message.get("timestamp", datetime.utcnow().isoformat())
        })
        # Simple anomaly detection placeholder – if NDVI drops below 0.3 trigger graph event
        if message.get("ndvi", 1) < 0.3:
            await publish_anomaly_event(message, "low_ndvi")
    except Exception as e:
        logger.exception("CIE: error processing farm_report: %s", e)

@collective_router.subscriber("sensor_streams")
async def handle_sensor_stream(message: dict):
    try:
        logger.info("CIE: Received sensor_reading %s", message)
        driver = Neo4jDriver()
        query = """
        MERGE (r:Region {name: $region})
        CREATE (s:SensorReading {
            sensor_id: $sensor_id,
            type: $type,
            value: $value,
            timestamp: datetime($timestamp)
        })
        MERGE (r)-[:HAS_SENSOR]->(s)
        RETURN id(s) AS reading_id
        """
        driver.run(query, {
            "region": message.get("region"),
            "sensor_id": message.get("sensor_id"),
            "type": message.get("type"),
            "value": message.get("value"),
            "timestamp": message.get("timestamp", datetime.utcnow().isoformat())
        })
        # Simple rule: humidity > 90 triggers anomaly
        if message.get("type") == "humidity" and message.get("value", 0) > 90:
            await publish_anomaly_event(message, "high_humidity")
    except Exception as e:
        logger.exception("CIE: error processing sensor_stream: %s", e)

async def publish_anomaly_event(payload: dict, anomaly_type: str):
    """Publish a graph anomaly event that the Orchestrator can consume."""
    from core.events import broker
    event = {
        "type": "anomaly",
        "anomaly_type": anomaly_type,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        await broker.publish(event, "graph.anomaly.detected")
        logger.info("CIE: Published anomaly event %s", anomaly_type)
    except Exception as e:
        logger.warning("CIE: Failed to publish anomaly event: %s", e)
