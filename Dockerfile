FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=10000 \
    DATA_DIR=/var/data

# PDF text extraction, scanned-PDF OCR (English + Arabic), and DOCX parsing.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates gosu python3 poppler-utils tesseract-ocr \
      tesseract-ocr-eng tesseract-ocr-ara \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app /var/data \
    && chown -R node:node /app /var/data

WORKDIR /app
COPY --chown=node:node . .
USER root

EXPOSE 10000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
