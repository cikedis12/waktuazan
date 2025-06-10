import ctypes
import time
import webbrowser
import threading
import os

# Load Dahua SDK DLL
sdk = ctypes.WinDLL('./sdk/dhnetsdk.dll')

# Device login credentials
DOOR_IP = b"10.254.170.190"
DOOR_PORT = 37777
USERNAME = b"admin"
PASSWORD = b"123456"

# Global login handle
login_handle = None

# CALLBACK TYPE for access event
CALLBACK_FUN = ctypes.CFUNCTYPE(None, ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)

# Define structure for device login (example placeholder)
class NET_DEVICEINFO(ctypes.Structure):
    _fields_ = [
        ("sSerialNumber", ctypes.c_char * 48),
        ("byAlarmInPortNum", ctypes.c_byte),
        ("byAlarmOutPortNum", ctypes.c_byte),
        ("byDiskNum", ctypes.c_byte),
        ("byDVRType", ctypes.c_byte),
        ("byChanNum", ctypes.c_byte),
        ("byStartChan", ctypes.c_byte),
        ("byAudioChanNum", ctypes.c_byte),
        ("byIPChanNum", ctypes.c_byte),
        ("reserved", ctypes.c_byte * 4)
    ]

def on_access_granted():
    print("[✓] Access granted - triggering face recognition...")
    webbrowser.open("http://localhost:5000/capture")

# Example fake callback (replace with real one from SDK)
@CALLBACK_FUN
def access_event_callback(lLoginID, pBuf, dwBufLen, dwUser):
    print("[EVENT] Access event detected.")
    on_access_granted()

def login_device():
    global login_handle
    device_info = NET_DEVICEINFO()
    error = ctypes.c_int()

    # Login function: CLIENT_LoginEx
    CLIENT_LoginEx = sdk.CLIENT_LoginEx2
    CLIENT_LoginEx.restype = ctypes.c_int
    CLIENT_LoginEx.argtypes = [ctypes.c_char_p, ctypes.c_ushort, ctypes.c_char_p, ctypes.c_char_p, ctypes.POINTER(NET_DEVICEINFO), ctypes.POINTER(ctypes.c_int)]

    login_handle = CLIENT_LoginEx(
        DOOR_IP,
        DOOR_PORT,
        USERNAME,
        PASSWORD,
        ctypes.byref(device_info),
        ctypes.byref(error)
    )

    if login_handle == 0:
        print(f"[✗] Login failed! Error code: {error.value}")
    else:
        print(f"[✓] Logged in to {DOOR_IP.decode()} successfully.")
        return True

    return False

def listen_for_access():
    if login_device():
        print("[✓] Listening for access events...")

        # Simulated loop; replace with actual SDK event registration:
        while True:
            # Simulate an access event every 30 seconds (replace with real callback)
            time.sleep(30)
            print("[✓] Simulated access event received.")
            on_access_granted()

    else:
        print("[✗] Unable to login to door device.")

if __name__ == "__main__":
    listen_thread = threading.Thread(target=listen_for_access)
    listen_thread.start()
