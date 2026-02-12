from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # These must match your .env file keys exactly
    PROJECT_NAME: str = "Guardian Fraud API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    SECRET_KEY: str

    # Tells Pydantic to read from the .env file in the root
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, env_file_encoding="utf-8")

settings = Settings()