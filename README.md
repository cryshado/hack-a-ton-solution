# hack-a-ton-solution

Streaming service with the use of [TON Payment Channels](https://github.com/ton-blockchain/payment-channels/blob/master/func/async-channel.func) 

## Main goal

There are currently no real financially decentralized streaming platforms. Our main goal was to create an MVP service for streamers and users that allows them to interact securely with each other. Users can connect to private rooms with a streamers, during the connection will be the opening of the payment channel. After that, for each minute of communication with the streamer, the user will be charged the designated streamer amount in TON. 

TON Blockchain, thanks to fast and cheap transactions, allows you to open payment channels instantly, then they in turn allow you to implement unimaginable things!

## Structure

| dir                               | description                           | 
| --------------------------------- | ------------------------------------- |
| [`backend`](/backend/)            |  service back-end                     |
| [`frontend`](/frontend/)          |  c2c (client-to-client) front-end     |
| [`turn-server`](/turn-server/)    |  mini TURN server for WebRTC          |
    

## Applicants

| applicant     | contact                                                                               | 
| ------------- | ------------------------------------------------------------------------------------- |
| John Fyodor   |  [github](https://github.com/tjifyodor) & [telegram](https://t.me/ohwhoopsiedaisy)    |
| cryshado      |  [github](https://github.com/cryshado) & [telegram](https://t.me/cryshado)            |
