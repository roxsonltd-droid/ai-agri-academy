"""
Observability Layer (OpenTelemetry + Prometheus).
Handles distributed tracing and metric collection.
"""

import logging

logger = logging.getLogger(__name__)

def setup_observability(app):
    """
    Configure OpenTelemetry and Prometheus for the FastAPI app.
    """
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from prometheus_client import make_asgi_app
        
        # Set up a global tracer provider (Console exporter for development/logging)
        provider = TracerProvider()
        processor = BatchSpanProcessor(ConsoleSpanExporter())
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        
        # Instrument FastAPI (adds tracing and metrics interceptors)
        FastAPIInstrumentor.instrument_app(app)
        
        # Mount Prometheus metrics endpoint
        metrics_app = make_asgi_app()
        app.mount("/metrics", metrics_app)
        
        logger.info("Observability enabled: OpenTelemetry Tracing + Prometheus /metrics mounted.")
        
    except ImportError as e:
        logger.warning(f"Observability packages missing. Skipping setup. ({e})")
    except Exception as e:
        logger.error(f"Failed to setup observability: {e}")
