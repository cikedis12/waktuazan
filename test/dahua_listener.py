import ctypes
import time
import webbrowser

# Load SDK DLLs
sdk = ctypes.WinDLL('./sdk/dhnetsdk.dll')

# Define callback types and device login...
# (we can provide full working sample — this part is technical)

def on_access_granted():
    # Open face recognition trigger
    webbrowser.open("http://localhost:5000/capture")

if __name__ == "__main__":
    # 1. Login to device using SDK
    # 2. Register callback for access event
    # 3. On event, call on_access_granted()

    print("Listening for door events...")
    while True:
        time.sleep(1)
