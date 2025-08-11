# Snowman's Himalayan Juice Bar 🏔️⛄🍹

An interactive virtual juice machine experience featuring a friendly snowman in a beautiful Himalayan habitat who operates a hand-operated cold presser to make fresh juice based on human demand detected through cameras.

## Features

### 🎥 Camera Integration
- Real-time camera feed for human detection
- Simulated detection mode when camera access is denied
- Position tracking (left, center, right, front, back)
- Demand level adjustment based on number of people detected

### ⛄ Snowman Character
- Animated snowman with blinking eyes and waving arms
- Responsive to human presence - looks at detected people
- Working animations when operating the juice machine
- Idle breathing animation for lifelike behavior

### 🍹 Juice Machine
- Hand-operated cold presser with realistic animations
- Multiple fruit types (apple, orange, strawberry)
- Dynamic ice cube addition (none, light, normal, extra)
- Soda dispenser with bubble effects
- Realistic juice colors and pouring animations

### 🏔️ Himalayan Habitat
- Beautiful mountain backdrop with multiple peaks
- Animated snowfall effect
- Gradient sky background
- Responsive design for different screen sizes

### 🔊 Audio Effects
- Pressing sounds when operating the cold presser
- Juice making sounds with different frequencies
- Web Audio API integration for realistic sound effects

## How to Use

1. **Start the Application**
   - Open `index.html` in a modern web browser
   - The application will load with the Himalayan scene

2. **Camera Setup**
   - Click "Start Camera" to enable real camera feed
   - If camera access is denied, simulation mode will activate
   - Human detection will automatically begin

3. **Interact with the Snowman**
   - The snowman will react to detected human presence
   - Watch as he looks toward detected people
   - Observe his idle animations and breathing

4. **Make Juice**
   - Click the red presser handle to operate the cold presser
   - Watch the snowman work and juice pour into the glass
   - Use "Add Ice" and "Add Soda" buttons to customize drinks
   - Click "Make Juice" for instant juice creation

5. **Control Animations**
   - Toggle continuous animations on/off
   - Watch snowfall and arm waving effects
   - Experience the full interactive environment

## Technical Details

### Camera Integration
- Uses `getUserMedia()` API for camera access
- Canvas overlay for detection visualization
- Fallback simulation mode for testing
- Real-time position and count tracking

### Animation System
- CSS animations for smooth visual effects
- JavaScript-controlled dynamic animations
- Responsive design for mobile devices
- Performance-optimized rendering

### Sound System
- Web Audio API for realistic sound effects
- Dynamic frequency and gain control
- Context-aware audio generation
- No external audio files required

## File Structure

```
snowman-juice-machine/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Future Enhancements

- [ ] Integration with real camera APIs for ESP32
- [ ] Machine learning-based human detection
- [ ] More fruit types and juice combinations
- [ ] Weather effects (snow intensity based on demand)
- [ ] Multi-language support
- [ ] Voice commands for juice ordering
- [ ] Recipe customization system
- [ ] Social media sharing features

## Development

This project is designed to be easily extensible. The modular JavaScript class structure allows for simple addition of new features:

- Add new fruit types in the `makeJuice()` method
- Extend camera detection in `detectMotion()`
- Create new animations in the CSS file
- Add sound effects in the `playSound()` method

## License

This project is open source and available under the MIT License.

---

**Enjoy your virtual juice experience with the friendly Himalayan snowman!** ⛄🍹