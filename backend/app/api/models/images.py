from typing import Annotated, Optional
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

PyObjectId = Annotated[str, BeforeValidator(str)]

class ImageModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    author: str | None = Field(None)
    born_died: str | None = Field(None)
    title: str = Field(...) #The '...' means its required
    date: str | None = Field(None) #None means its optional, or we can set to a default value
    technique: str | None = Field(None)
    location: str | None = Field(None)
    form: str | None = Field(None)
    type: str | None = Field(None)
    school: str | None = Field(None)
    timeline: str | None = Field(None)
    url: str = Field(None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "title": "Allegory",
                "author": "Hans von",
                "date": "c. 1596",
                "technique": "Oil on copper, 56 x 47 cm",
                "location": "Alte Pinakothek, Munich",
                "form": "painting",
                "type": "mythological",
                "school": "german",
                "timeline": "1601-1650",
                "url": "/static/images/8093e6ed-b071-4ab3-81c5-905bc82f7840.jpg"
            }
        },
    )

class RetrievedImageModel(ImageModel):
    score: float = Field(...)