FROM golang:1.26.5-alpine AS builder
WORKDIR /build/
RUN apk add --no-cache tzdata ca-certificates
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o miu-guide-back ./cmd/server

FROM scratch
WORKDIR /root/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/miu-guide-back .
CMD ["./miu-guide-back"]