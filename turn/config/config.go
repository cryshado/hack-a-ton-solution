package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type serverConfig struct {
	Host     string
	PublicIP string
	Port     int
	Realm    string
}

var CFG serverConfig

func parseEnvInt(varInt *int, envName string) {
	parsed, err := strconv.Atoi(os.Getenv(envName))
	if err != nil {
		logrus.Errorf("can't parse %s from env", envName)
	}

	*varInt = parsed
}

func Configure() {
	godotenv.Load()

	parseEnvInt(&CFG.Port, "PORT")

	CFG.Host = os.Getenv("HOST")
	CFG.PublicIP = os.Getenv("PUBLIC_IP")
	CFG.Realm = os.Getenv("REALM")
}
