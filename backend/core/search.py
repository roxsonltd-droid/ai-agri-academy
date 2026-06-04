import typesense
import logging
from core.config import settings

logger = logging.getLogger(__name__)

def get_typesense_client() -> typesense.Client | None:
    if not settings.TYPESENSE_HOST or not settings.TYPESENSE_ADMIN_API_KEY:
        return None
        
    return typesense.Client({
        'nodes': [{
            'host': settings.TYPESENSE_HOST,
            'port': '443',
            'protocol': 'https'
        }],
        'api_key': settings.TYPESENSE_ADMIN_API_KEY,
        'connection_timeout_seconds': 2
    })

def init_typesense_collections():
    client = get_typesense_client()
    if not client:
        logger.warning("Typesense is not configured. Skipping collection initialization.")
        return

    # Define the schema for 'lessons'
    lessons_schema = {
        'name': 'lessons',
        'fields': [
            {'name': 'id', 'type': 'string'},
            {'name': 'title', 'type': 'string'},
            {'name': 'content', 'type': 'string'},
            {'name': 'course_id', 'type': 'string'},
            {'name': 'type', 'type': 'string', 'facet': True}, # 'video', 'pdf', 'text'
        ],
        'default_sorting_field': ''
    }

    try:
        # Check if it already exists
        client.collections['lessons'].retrieve()
        logger.info("Typesense 'lessons' collection already exists.")
    except typesense.exceptions.ObjectNotFound:
        # Create if it doesn't exist
        client.collections.create(lessons_schema)
        logger.info("Created Typesense 'lessons' collection.")
    except Exception as e:
        logger.error(f"Error initializing Typesense: {e}")

def index_lesson(lesson_id: str, title: str, content: str, course_id: str, lesson_type: str = "text"):
    """Adds or updates a lesson in the Typesense index."""
    client = get_typesense_client()
    if not client:
        return
        
    document = {
        'id': lesson_id,
        'title': title,
        'content': content,
        'course_id': course_id,
        'type': lesson_type
    }
    
    try:
        client.collections['lessons'].documents.upsert(document)
    except Exception as e:
        logger.error(f"Error indexing lesson {lesson_id} to Typesense: {e}")
