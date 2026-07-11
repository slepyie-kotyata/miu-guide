FROM golang:1.26.5-alpine AS builder
WORKDIR /build/
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o miu-guide-back ./cmd/server

FROM scratch
WORKDIR /root/
COPY --from=builder /build/miu-guide-back .
CMD ["./miu-guide-back"]