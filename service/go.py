import os
from dotenv import load_dotenv 

load_dotenv()
print(os.getenv("GOOGLE_CLOUD_PROJECT"))  # Should not be None