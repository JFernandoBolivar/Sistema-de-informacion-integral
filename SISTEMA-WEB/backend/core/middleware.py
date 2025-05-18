import logging
from django.db import connection
from django.db.utils import OperationalError
from django.http import JsonResponse

logger = logging.getLogger(__name__)

class DatabaseConnectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except OperationalError as e:
            if "database is locked" in str(e):
                logger.warning("Database lock detected, retrying operation")
                # Close any existing connections
                connection.close()
                # Retry the request
                try:
                    response = self.get_response(request)
                    return response
                except OperationalError as retry_error:
                    logger.error(f"Database operation failed after retry: {retry_error}")
                    return JsonResponse({
                        'error': 'Database is temporarily unavailable. Please try again.'
                    }, status=503)
            raise
        finally:
            # Always close the connection after the request
            connection.close()

