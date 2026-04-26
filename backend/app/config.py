from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = 'postgresql://postgres:your_password@localhost:5432/restaurant_db'
    SECRET_KEY: str = 'your-super-secret-key-change-this-in-production-2026'
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    AWS_ACCESS_KEY_ID : str
    AWS_SECRET_ACCESS_KEY : str
    AWS_BUCKET_NAME : str
    AWS_REGION : str
    UNSPLASH_ACCESS_KEY : str

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

settings = Settings()
