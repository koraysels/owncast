package handlers

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/owncast/owncast/static"
)

var staticServer = http.FileServer(http.FS(static.GetWeb()))
var devFrontendProxy *httputil.ReverseProxy

func init() {
	if devFrontendURL := os.Getenv("OWNCAST_DEV_FRONTEND"); devFrontendURL != "" {
		target, _ := url.Parse(devFrontendURL)
		devFrontendProxy = httputil.NewSingleHostReverseProxy(target)
	}
}

// serveWeb will serve web assets.
func serveWeb(w http.ResponseWriter, r *http.Request) {
	if devFrontendProxy != nil {
		devFrontendProxy.ServeHTTP(w, r)
		return
	}
	staticServer.ServeHTTP(w, r)
}
