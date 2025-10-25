class ServiceError(Exception):
    """Base class for all service-layer errors."""
    pass

class ItemNotFoundError(ServiceError):
    """Raised when an item is not found in the database."""
    pass

class InvalidIDError(ServiceError):
    """Raised when a provided ID has an invalid format."""
    pass

class InvalidMediaType(ServiceError):
    """Raised when invalid media type is passed"""
    pass

class DatabaseError(ServiceError):
    """Raised when an unrecoverable database error occurs"""
    pass