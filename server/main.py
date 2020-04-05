import os
import asyncio
import websockets

import server

ip = "127.0.0.1"
port = 5678

start_server = websockets.serve(server.serve, ip, port)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()