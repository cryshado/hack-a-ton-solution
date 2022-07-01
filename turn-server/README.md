# turn-server

Mini UDP TURN server written in Go

## Pre-requisites
```
docker version 20.10.8 or newer
docker-compose version 1.29.2 or newer
```

## Quick setup

1. Create an `.env` file based on the `.env.template`
2. Set `PORT=4559` in `.env`
3. Run `docker-compose up --build --force-recreate`
4. Done! The server is now running with the Nginx proxy at `0.0.0.0:5555`
