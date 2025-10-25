from functools import lru_cache
from transformers import AutoProcessor, AutoModel, AutoTokenizer, SiglipModel, SiglipProcessor, SiglipTokenizer
import os
import logging

MODEL = os.environ.get('ENCODER_MODEL')

@lru_cache(maxsize=1)
def get_sglip_model() -> SiglipModel:
    logging.info('Loading Model...')
    model = AutoModel.from_pretrained(MODEL)
    return model

@lru_cache(maxsize=1)
def get_sglip_processor() -> SiglipProcessor:
    logging.info('Loading Processor...')
    processor = AutoProcessor.from_pretrained(MODEL, use_fast=True)
    return processor

@lru_cache(maxsize=1)
def get_sglip_tokenizer() -> SiglipTokenizer:
    logging.info('Loading Tokenizer...')
    tokenizer = AutoTokenizer.from_pretrained(MODEL, use_fast=True)
    return tokenizer