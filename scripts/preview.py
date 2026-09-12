"""Build and serve only the public portfolio on localhost. Ctrl+C stops the server."""
import functools
import http.server
import threading
import webbrowser
from build import build, ROOT

if __name__ == '__main__':
    build()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / '_site'))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'\nPortfolio: {url}\nKeep this window open. Press Ctrl+C to stop.\n', flush=True)
    threading.Timer(.5, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
