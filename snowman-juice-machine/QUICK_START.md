# Quick Start Guide 🚀

Get your Snowman's Himalayan Juice Bar running in minutes!

## Option 1: Simple Browser Setup (Recommended)

1. **Download the files**
   - Download all files from the `snowman-juice-machine` folder
   - Keep the folder structure intact

2. **Open in browser**
   - Double-click `index.html` to open in your web browser
   - Or drag `index.html` into your browser window

3. **Start using**
   - Click "Start Camera" to enable camera detection
   - Watch the snowman react to human presence
   - Click the red presser handle to make juice
   - Use the control buttons to customize your drink

## Option 2: Local Server Setup

1. **Start the server**
   ```bash
   cd snowman-juice-machine
   python server.py
   ```

2. **Open in browser**
   - Go to `http://localhost:8000`
   - The application will load automatically

3. **Enjoy the experience**
   - The snowman will detect human presence
   - Watch him work the cold presser
   - Customize your juice with ice and soda

## Option 3: ESP32 Integration

1. **Prepare your ESP32**
   - Install required libraries in Arduino IDE:
     - ESP32 Camera
     - WebSocketsServer
     - ArduinoJson
     - ESPAsyncWebServer
     - AsyncTCP

2. **Configure WiFi**
   - Edit `esp32-camera-integration.ino`
   - Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your network details

3. **Upload to ESP32**
   - Connect your ESP32 with camera module
   - Upload the sketch to your ESP32
   - Note the IP address shown in Serial Monitor

4. **Connect to ESP32**
   - Open `http://[ESP32_IP_ADDRESS]/ws-info` in browser
   - Use the WebSocket URL to connect the web app to ESP32

## Features to Try

### 🎥 Camera Detection
- **Start Camera**: Enable real camera feed
- **Simulation Mode**: Works without camera access
- **Position Tracking**: See where people are detected

### ⛄ Snowman Interactions
- **Idle Animation**: Watch the snowman breathe and blink
- **Reactive Behavior**: Snowman looks at detected people
- **Working Animation**: See him operate the juice machine

### 🍹 Juice Making
- **Cold Presser**: Click the red handle to operate
- **Multiple Fruits**: Apple, orange, and strawberry juices
- **Ice Addition**: Cycle through ice levels (none, light, normal, extra)
- **Soda Mixing**: Add carbonation with bubble effects

### 🏔️ Himalayan Environment
- **Mountain Backdrop**: Beautiful Himalayan peaks
- **Snowfall Effect**: Animated snow particles
- **Responsive Design**: Works on desktop and mobile

## Troubleshooting

### Camera Not Working?
- Check browser permissions for camera access
- Try refreshing the page
- Use simulation mode if camera is unavailable

### ESP32 Connection Issues?
- Verify WiFi credentials are correct
- Check Serial Monitor for connection status
- Ensure ESP32 and computer are on same network

### Animations Not Smooth?
- Try a different browser (Chrome recommended)
- Close other browser tabs to free up memory
- Check if hardware acceleration is enabled

## Next Steps

1. **Customize the Experience**
   - Modify colors and animations in `styles.css`
   - Add new fruit types in `script.js`
   - Create custom sound effects

2. **Integrate with Real Hardware**
   - Connect actual cameras to ESP32
   - Add physical buttons and sensors
   - Implement real juice dispensing

3. **Extend Functionality**
   - Add voice commands
   - Implement recipe system
   - Create user accounts and preferences

## Support

- Check the main `README.md` for detailed documentation
- Review the code comments for implementation details
- Open an issue on GitHub for bugs or feature requests

---

**Enjoy your virtual juice experience with the friendly Himalayan snowman!** ⛄🍹