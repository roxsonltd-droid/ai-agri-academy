import uuid
from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Parcel(Base):
    """
    Geospatial model for farm fields/parcels.
    Utilizes PostGIS for storing geographic boundaries.
    """
    __tablename__ = "parcels"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, index=True)
    crop_type = Column(String, index=True, nullable=True)
    area_hectares = Column(Float, default=0.0)
    
    # PostGIS Geometry column for the field boundaries (WGS 84)
    # Using management=True ensures PostGIS correctly handles this column in SQLAlchemy
    boundaries = Column(Geometry('POLYGON', srid=4326, management=True), nullable=True)
    
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", backref="parcels")
