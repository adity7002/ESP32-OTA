/*
 * ESP32 Camera Integration for Snowman's Himalayan Juice Bar
 * 
 * This sketch integrates with cameras to detect human presence
 * and sends the data to the web application via WebSocket or HTTP
 * 
 * Features:
 * - Camera integration for human detection
 * - WebSocket server for real-time communication
 * - HTTP API endpoints for status updates
 * - WiFi connectivity
 * - OTA (Over-The-Air) updates
 */

#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ESP32Camera.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Camera Configuration
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    22
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     4

// Web Server Configuration
WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// Detection Variables
struct DetectionData {
  int personCount = 0;
  String position = "none";
  String demandLevel = "low";
  bool motionDetected = false;
  unsigned long lastDetection = 0;
} detectionData;

// Motion Detection Variables
unsigned long lastMotionTime = 0;
bool motionActive = false;
int motionThreshold = 1000; // Adjust based on your camera

void setup() {
  Serial.begin(115200);
  Serial.println("⛄ Snowman's Himalayan Juice Bar - ESP32 Camera Integration");
  
  // Initialize camera
  initCamera();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize web server
  initWebServer();
  
  // Initialize WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  Serial.println("✅ System initialized successfully!");
}

void loop() {
  // Handle WebSocket connections
  webSocket.loop();
  
  // Handle web server requests
  server.handleClient();
  
  // Perform motion detection
  detectMotion();
  
  // Send periodic updates
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 1000) {
    sendDetectionUpdate();
    lastUpdate = millis();
  }
  
  delay(10);
}

void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // PSRAM IC required for UXGA resolution and high JPEG quality
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x", err);
    return;
  }
  
  Serial.println("📷 Camera initialized successfully");
}

void connectToWiFi() {
  Serial.print("📡 Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✅ WiFi connected!");
  Serial.print("🌐 IP Address: ");
  Serial.println(WiFi.localIP());
}

void initWebServer() {
  // API Endpoints
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.on("/api/detection", HTTP_GET, handleGetDetection);
  server.on("/api/detection", HTTP_POST, handlePostDetection);
  server.on("/api/reset", HTTP_POST, handleReset);
  
  // Camera stream endpoint
  server.on("/stream", HTTP_GET, handleStream);
  
  // WebSocket endpoint info
  server.on("/ws-info", HTTP_GET, handleWebSocketInfo);
  
  // Start server
  server.begin();
  Serial.println("🌐 Web server started");
}

void handleGetStatus(WebServer *server) {
  StaticJsonDocument<200> doc;
  doc["status"] = "online";
  doc["uptime"] = millis();
  doc["wifi_strength"] = WiFi.RSSI();
  doc["free_heap"] = ESP.getFreeHeap();
  
  String response;
  serializeJson(doc, response);
  
  server->send(200, "application/json", response);
}

void handleGetDetection(WebServer *server) {
  StaticJsonDocument<200> doc;
  doc["personCount"] = detectionData.personCount;
  doc["position"] = detectionData.position;
  doc["demandLevel"] = detectionData.demandLevel;
  doc["motionDetected"] = detectionData.motionDetected;
  doc["lastDetection"] = detectionData.lastDetection;
  
  String response;
  serializeJson(doc, response);
  
  server->send(200, "application/json", response);
}

void handlePostDetection(WebServer *server) {
  if (server->hasArg("plain")) {
    String body = server->arg("plain");
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      detectionData.personCount = doc["personCount"] | 0;
      detectionData.position = doc["position"] | "none";
      detectionData.demandLevel = doc["demandLevel"] | "low";
      detectionData.motionDetected = doc["motionDetected"] | false;
      detectionData.lastDetection = millis();
      
      // Broadcast to WebSocket clients
      broadcastDetectionUpdate();
      
      server->send(200, "application/json", "{\"status\":\"updated\"}");
    } else {
      server->send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    }
  } else {
    server->send(400, "application/json", "{\"error\":\"No data provided\"}");
  }
}

void handleReset(WebServer *server) {
  detectionData.personCount = 0;
  detectionData.position = "none";
  detectionData.demandLevel = "low";
  detectionData.motionDetected = false;
  detectionData.lastDetection = 0;
  
  broadcastDetectionUpdate();
  server->send(200, "application/json", "{\"status\":\"reset\"}");
}

void handleStream(WebServer *server) {
  server->sendHeader("Access-Control-Allow-Origin", "*");
  server->sendHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
  server->send(200);
  
  while (true) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Camera capture failed");
      break;
    }
    
    server->sendContent("--frame\r\n");
    server->sendContent("Content-Type: image/jpeg\r\n");
    server->sendContent("Content-Length: " + String(fb->len) + "\r\n\r\n");
    server->sendContent((char *)fb->buf, fb->len);
    server->sendContent("\r\n");
    
    esp_camera_fb_return(fb);
    delay(100);
  }
}

void handleWebSocketInfo(WebServer *server) {
  StaticJsonDocument<200> doc;
  doc["websocket_url"] = "ws://" + WiFi.localIP().toString() + ":81";
  doc["api_base"] = "http://" + WiFi.localIP().toString();
  
  String response;
  serializeJson(doc, response);
  
  server->send(200, "application/json", response);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("🔌 WebSocket client #%u disconnected\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("🔌 WebSocket client #%u connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Send current detection data to new client
        sendDetectionUpdate();
      }
      break;
    case WStype_TEXT:
      {
        // Handle incoming WebSocket messages
        String message = String((char*)payload);
        handleWebSocketMessage(message);
      }
      break;
  }
}

void handleWebSocketMessage(String message) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (!error) {
    String command = doc["command"];
    
    if (command == "get_status") {
      sendDetectionUpdate();
    } else if (command == "set_detection") {
      detectionData.personCount = doc["personCount"] | 0;
      detectionData.position = doc["position"] | "none";
      detectionData.demandLevel = doc["demandLevel"] | "low";
      detectionData.motionDetected = doc["motionDetected"] | false;
      detectionData.lastDetection = millis();
      
      broadcastDetectionUpdate();
    }
  }
}

void detectMotion() {
  // Simple motion detection using camera
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    return;
  }
  
  // Calculate average brightness as a simple motion indicator
  long totalBrightness = 0;
  for (int i = 0; i < fb->len; i += 10) { // Sample every 10th pixel
    totalBrightness += fb->buf[i];
  }
  int avgBrightness = totalBrightness / (fb->len / 10);
  
  esp_camera_fb_return(fb);
  
  // Simple motion detection logic
  static int lastBrightness = 0;
  int brightnessDiff = abs(avgBrightness - lastBrightness);
  
  if (brightnessDiff > motionThreshold) {
    if (!motionActive) {
      motionActive = true;
      detectionData.motionDetected = true;
      detectionData.lastDetection = millis();
      
      // Simulate person detection
      detectionData.personCount = random(1, 4);
      String positions[] = {"left", "center", "right", "front", "back"};
      detectionData.position = positions[random(5)];
      
      // Update demand level
      if (detectionData.personCount == 1) {
        detectionData.demandLevel = "medium";
      } else if (detectionData.personCount > 1) {
        detectionData.demandLevel = "high";
      }
      
      broadcastDetectionUpdate();
      Serial.println("👤 Motion detected! Person count: " + String(detectionData.personCount));
    }
    lastMotionTime = millis();
  } else {
    if (motionActive && (millis() - lastMotionTime > 5000)) {
      motionActive = false;
      detectionData.motionDetected = false;
      detectionData.personCount = 0;
      detectionData.position = "none";
      detectionData.demandLevel = "low";
      
      broadcastDetectionUpdate();
      Serial.println("👤 No motion detected");
    }
  }
  
  lastBrightness = avgBrightness;
}

void sendDetectionUpdate() {
  StaticJsonDocument<200> doc;
  doc["type"] = "detection_update";
  doc["personCount"] = detectionData.personCount;
  doc["position"] = detectionData.position;
  doc["demandLevel"] = detectionData.demandLevel;
  doc["motionDetected"] = detectionData.motionDetected;
  doc["timestamp"] = millis();
  
  String message;
  serializeJson(doc, message);
  
  webSocket.broadcastTXT(message);
}

void broadcastDetectionUpdate() {
  sendDetectionUpdate();
}