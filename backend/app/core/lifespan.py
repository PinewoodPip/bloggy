"""
    Manages app lifespan - the setup & shutdown procedures, before & after requests are handled respectively.
"""
from contextlib import asynccontextmanager
from elasticsearch import Elasticsearch
from fastapi import FastAPI
from sqlalchemy.orm import Session
from core.utils import get_elastic_search
from core.config import CONFIG, SessionLocal
from models.user import User
from crud.user import create_default_admin
from crud.category import create_root_category
import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()

    # Wait until the database is ready to accept connections
    while True:
        try:
            db.query(User).first()
            break
        except Exception as e:
            print("Database not ready (", str(e), "), retrying in 1 second")
            time.sleep(1)

    # Ensure essential entities exist
    create_default_admin(db)
    create_root_category(db)

    # Initialize ES indices if it's enabled
    if CONFIG.ES_ENABLED:
        es: Elasticsearch = Elasticsearch([CONFIG.ES_URL], basic_auth=(CONFIG.ES_USERNAME, CONFIG.ES_PASSWORD))
        while not es.ping():
            print("Waiting for Elasticsearch to start...")
            time.sleep(1)

        # Create ES indices and mappings
        # es.indices.delete(index="articles")
        if not es.indices.exists(index="articles"):
            es.indices.create(index="articles", settings={
                "analysis": {
                    "analyzer": {
                        "default": {
                            # Standardize all text fields; will make them lowercase, remove stopwords, stub/stem them (ex. remove verbal tense)
                            "type": "standard",
                        }
                    }
                }
            })
            es.indices.put_mapping(index="articles", properties={
                "title": {"type": "text"},
                "authors": {"type": "text"},
                "content": {"type": "search_as_you_type"},
                "summary": {"type": "search_as_you_type"},
            })

        es.close()

    yield
