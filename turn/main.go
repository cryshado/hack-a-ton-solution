package main

import (
	"fmt"
	"net"
	"strconv"
	"turn/config"
	_ "turn/log"

	"github.com/sirupsen/logrus"
)

func main() {
	config.Configure()

	_ /* tcpLstnr */, err := net.Listen(
		"tcp4", fmt.Sprintf(
			"%s:%s",
			config.CFG.Host,
			strconv.Itoa(config.CFG.Port),
		),
	)

	if err != nil {
		logrus.Fatalf("Error while creating TURN server TCP listener: %s", err)
	}
}
