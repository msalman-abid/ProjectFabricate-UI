# use nvidia cuda image as base image\
FROM python:3.8.17-bookworm

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

# set working directory
WORKDIR /app

# copy requirements.txt file
COPY requirements.txt .

# install dependencies
RUN pip install -r requirements.txt

# copy all files from current directory to working directory
COPY . .

# run app
CMD ["python3", "app.py"]
