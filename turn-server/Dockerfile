FROM golang:1.18-alpine3.16 as prod

WORKDIR /app

COPY ./go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

RUN go build main.go -o main

CMD [ "./main" ]