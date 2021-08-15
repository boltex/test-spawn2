# Python 3 server example
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading, sys

hostName = "localhost"
serverPort = 8080
callCount = 0
limit = 7

def printIt():
    if callCount<=limit:
        threading.Timer(3.0, printIt).start()
    print("python output each 3s", flush=True)
    print("Total server so far:"+  str(callCount), flush=True)

class MyServer(BaseHTTPRequestHandler):

    def do_GET(self):
        global callCount, limit
        if "favicon" in self.path:
            print("favicon")
        else:
            callCount = callCount + 1
        print("Serving http request # " + str(callCount), flush=True)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>Will Serve %s times max</title></head>"% self.limit, "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        self.wfile.write(bytes("<p>Call Count: %s</p>" % str(callCount), "utf-8"))
        self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))
        if callCount > limit:
            raise KeyboardInterrupt
        # Exited the whole server after 2 requests.

if __name__ == "__main__":
    printIt() # start test print output every 3 seconds

    # simple http webserver to simulate serving Leo on websockets
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort), flush=True)

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.shutdown()
    webServer.server_close()
    webServer.socket.close()
    print("Server stopped.", flush=True)

    sys.exit()