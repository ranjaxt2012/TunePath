"""
App config. R2 URLs: use direct public URLs for MVP.
Future: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY for presigned URLs.
"""
import os

# R2 public base URL for media assets (e.g. https://pub-xxx.r2.dev or custom domain)
R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL", "https://assets.tunepath.com")
