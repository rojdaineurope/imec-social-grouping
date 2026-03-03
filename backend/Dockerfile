# Python tabanlı resmi imajı kullan
FROM python:3.10-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Gerekli sistem paketlerini yükle
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm kodu kopyala
COPY . .

# FastAPI'yi başlat
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]