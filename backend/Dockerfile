FROM python:3.12

# Install dependencies and copy code
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./app /app
# conftest.py expects a separate env file
COPY ./.docker.env /.test.env

# Wait to ensure the DB container has enough time to start up
CMD ["sleep", "5"]

# Run app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Expose port
EXPOSE 8000
