import boto3
import requests
from ..config import settings

s3 = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def upload_to_s3(file, folder="menu-items"):
    file_name = f"{folder}/{file.filename}"
    s3.upload_fileobj(
        file.file, 
        settings.AWS_BUCKET_NAME, 
        file_name, 
        ExtraArgs={'ACL': 'public-read'}
    )
    return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{file_name}"

def get_auto_image(dish_name: str):
    try:
        url = f"https://api.unsplash.com/search/photos?query={dish_name} food&per_page=1"
        headers = {"Authorization": f"Client-ID {settings.UNSPLASH_ACCESS_KEY}"}
        response = requests.get(url, headers=headers).json()
        if response['results']:
            return response['results'][0]['urls']['regular']
    except:
        pass
    # Fallback image if everything fails
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"