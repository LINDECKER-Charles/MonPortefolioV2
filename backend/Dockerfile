FROM rust:1.98-bookworm AS build
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --locked --release

FROM debian:bookworm-slim AS runtime
LABEL org.opencontainers.image.title="monportefoliov2-backend" \
      org.opencontainers.image.description="API Rust du portfolio de Charles Lindecker" \
      org.opencontainers.image.source="https://github.com/LINDECKER-Charles/MonPortefolioV2" \
      org.opencontainers.image.licenses="MIT"
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --create-home portfolio
WORKDIR /app
COPY --from=build /app/target/release/portfolio-backend /usr/local/bin/portfolio-backend
RUN mkdir /data && chown portfolio:portfolio /data
USER portfolio
ENV BACKEND_ADDR=0.0.0.0:8080 DATABASE_PATH=/data/portfolio.sqlite3
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8080/api/health >/dev/null || exit 1
CMD ["portfolio-backend"]
