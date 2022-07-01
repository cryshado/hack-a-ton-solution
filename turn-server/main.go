package main

import (
	"fmt"
	"net"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"turn-server/config"
	_ "turn-server/log"

	"github.com/pion/logging"
	"github.com/pion/turn/v2"
	"github.com/sirupsen/logrus"
)

func authHandler(user string, realm string, srcAddr net.Addr) ([]byte, bool) {
	// always allow access
	key := turn.GenerateAuthKey(
		"default-user",
		config.CFG.Realm,
		"default-password",
	)

	return key, true
}

func main() {
	logrus.Info("Starting the \"turn-server\"")

	config.Configure()

	hostPort := fmt.Sprintf("%s:%s", config.CFG.Host, strconv.Itoa(config.CFG.Port))
	logrus.Infof("public-ip: %s", config.CFG.PublicIP)
	logrus.Infof("host:port: %s", hostPort)

	udpLstnr, err := net.ListenPacket("udp4", hostPort)

	if err != nil {
		logrus.Fatalf("Error while creating TURN server UDP listener: %s", err)
	}

	server, err := turn.NewServer(turn.ServerConfig{
		Realm:       config.CFG.Realm,
		AuthHandler: authHandler,
		PacketConnConfigs: []turn.PacketConnConfig{
			{
				PacketConn: udpLstnr,
				RelayAddressGenerator: &turn.RelayAddressGeneratorStatic{
					RelayAddress: net.ParseIP(config.CFG.PublicIP),
					Address:      config.CFG.Host,
				},
			},
		},
		LoggerFactory: logging.NewDefaultLoggerFactory(),
	})

	if err != nil {
		logrus.Fatalf("Error while turn.NewServer: %s", err)
	}

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	<-signals

	if err = server.Close(); err != nil {
		logrus.Fatalf("Error while server.Close(): %s", err)
	}
}
