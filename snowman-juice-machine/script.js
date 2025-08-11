class SnowmanJuiceMachine {
    constructor() {
        this.camera = null;
        this.detectionCanvas = null;
        this.detectionCtx = null;
        this.isAnimating = false;
        this.demandLevel = 'low';
        this.currentJuice = 'apple';
        this.iceLevel = 'normal';
        this.sodaLevel = 'none';
        this.personCount = 0;
        this.personPosition = 'none';
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.startSnowmanIdleAnimation();
        this.updateDisplay();
    }

    setupElements() {
        this.detectionCanvas = document.getElementById('detectionCanvas');
        this.detectionCtx = this.detectionCanvas.getContext('2d');
        this.camera = document.getElementById('cameraVideo');
        
        // Set canvas size to match video
        this.detectionCanvas.width = 400;
        this.detectionCanvas.height = 300;
    }

    setupEventListeners() {
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('toggleAnimation').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('makeJuice').addEventListener('click', () => this.makeJuice());
        document.getElementById('addIce').addEventListener('click', () => this.addIce());
        document.getElementById('addSoda').addEventListener('click', () => this.addSoda());
        
        // Cold presser interaction
        document.querySelector('.presser-handle').addEventListener('click', () => this.operatePresser());
        
        // Simulate human detection
        setInterval(() => this.simulateHumanDetection(), 3000);
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 400, 
                    height: 300,
                    facingMode: 'environment'
                } 
            });
            this.camera.srcObject = stream;
            this.startDetection();
        } catch (error) {
            console.log('Camera access denied, using simulation mode');
            this.startSimulationMode();
        }
    }

    startSimulationMode() {
        // Create a simulated video feed
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Draw a simulated camera feed
        const drawSimulation = () => {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, 400, 300);
            
            // Draw some moving shapes to simulate activity
            ctx.fillStyle = '#3498db';
            ctx.fillRect(Math.random() * 350, Math.random() * 250, 50, 50);
            
            // Convert canvas to video stream
            const stream = canvas.captureStream(30);
            this.camera.srcObject = stream;
        };
        
        setInterval(drawSimulation, 100);
    }

    startDetection() {
        // Simple motion detection simulation
        setInterval(() => {
            this.detectMotion();
        }, 1000);
    }

    detectMotion() {
        // Simulate motion detection
        const hasMotion = Math.random() > 0.7;
        if (hasMotion) {
            this.personCount = Math.floor(Math.random() * 3) + 1;
            this.personPosition = this.getRandomPosition();
            this.updateDemand();
            this.updateDisplay();
        }
    }

    simulateHumanDetection() {
        // Simulate human presence detection
        const detected = Math.random() > 0.5;
        if (detected) {
            this.personCount = Math.floor(Math.random() * 3) + 1;
            this.personPosition = this.getRandomPosition();
            this.updateDemand();
            this.snowmanReaction();
        } else {
            this.personCount = 0;
            this.personPosition = 'none';
        }
        this.updateDisplay();
    }

    getRandomPosition() {
        const positions = ['left', 'center', 'right', 'front', 'back'];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    updateDemand() {
        if (this.personCount === 0) {
            this.demandLevel = 'low';
        } else if (this.personCount === 1) {
            this.demandLevel = 'medium';
        } else {
            this.demandLevel = 'high';
        }
    }

    snowmanReaction() {
        const snowman = document.getElementById('snowman');
        
        // Make snowman look at the person
        if (this.personPosition === 'left') {
            snowman.style.transform = 'translateX(-20px)';
        } else if (this.personPosition === 'right') {
            snowman.style.transform = 'translateX(20px)';
        } else {
            snowman.style.transform = 'translateX(0)';
        }
        
        // Reset position after animation
        setTimeout(() => {
            snowman.style.transform = 'translateX(0)';
        }, 2000);
    }

    operatePresser() {
        const handle = document.querySelector('.presser-handle');
        const presser = document.getElementById('coldPresser');
        
        // Animate the presser
        handle.style.transform = 'translateY(20px)';
        presser.style.transform = 'translateX(-50%) scale(0.95)';
        
        // Add pressing sound effect
        this.playSound('press');
        
        setTimeout(() => {
            handle.style.transform = 'translateY(0)';
            presser.style.transform = 'translateX(-50%) scale(1)';
        }, 500);
        
        // Make juice after pressing
        setTimeout(() => this.makeJuice(), 600);
    }

    makeJuice() {
        const juiceLiquid = document.getElementById('juiceLiquid');
        const glass = document.getElementById('juiceGlass');
        
        // Determine juice color based on current type
        let juiceColor;
        switch(this.currentJuice) {
            case 'apple':
                juiceColor = 'linear-gradient(to top, #E74C3C, #C0392B)';
                break;
            case 'orange':
                juiceColor = 'linear-gradient(to top, #F39C12, #E67E22)';
                break;
            case 'strawberry':
                juiceColor = 'linear-gradient(to top, #E91E63, #C2185B)';
                break;
            default:
                juiceColor = 'linear-gradient(to top, #FF6B35, #F39C12)';
        }
        
        juiceLiquid.style.background = juiceColor;
        juiceLiquid.style.height = '80%';
        
        // Add ice if requested
        if (this.iceLevel !== 'none') {
            this.addIceCubes();
        }
        
        // Add soda if requested
        if (this.sodaLevel !== 'none') {
            this.addSodaBubbles();
        }
        
        // Animate snowman working
        this.animateSnowmanWorking();
        
        // Play juice making sound
        this.playSound('juice');
        
        // Reset glass after some time
        setTimeout(() => {
            juiceLiquid.style.height = '0%';
        }, 5000);
    }

    addIce() {
        const levels = ['none', 'light', 'normal', 'extra'];
        const currentIndex = levels.indexOf(this.iceLevel);
        this.iceLevel = levels[(currentIndex + 1) % levels.length];
        this.updateDisplay();
    }

    addSoda() {
        const levels = ['none', 'light', 'normal', 'extra'];
        const currentIndex = levels.indexOf(this.sodaLevel);
        this.sodaLevel = levels[(currentIndex + 1) % levels.length];
        this.updateDisplay();
    }

    addIceCubes() {
        const glass = document.getElementById('juiceGlass');
        
        // Create ice cube elements
        for (let i = 0; i < 3; i++) {
            const iceCube = document.createElement('div');
            iceCube.className = 'ice-cube';
            iceCube.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: #AED6F1;
                border-radius: 2px;
                opacity: 0.8;
                top: ${20 + i * 15}px;
                left: ${10 + i * 5}px;
                animation: float 2s ease-in-out infinite;
            `;
            glass.appendChild(iceCube);
            
            // Remove ice cube after animation
            setTimeout(() => {
                if (iceCube.parentNode) {
                    iceCube.parentNode.removeChild(iceCube);
                }
            }, 5000);
        }
    }

    addSodaBubbles() {
        const glass = document.getElementById('juiceGlass');
        
        // Create bubble elements
        for (let i = 0; i < 5; i++) {
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                bottom: 0;
                left: ${10 + i * 8}px;
                animation: bubbleRise 3s ease-out infinite;
            `;
            glass.appendChild(bubble);
            
            // Remove bubble after animation
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 3000);
        }
    }

    animateSnowmanWorking() {
        const snowman = document.getElementById('snowman');
        const rightArm = document.querySelector('.right-arm');
        
        // Animate arm movement
        rightArm.style.animation = 'none';
        rightArm.offsetHeight; // Trigger reflow
        rightArm.style.animation = 'armWave 0.5s ease-in-out 3';
        
        // Make snowman bounce slightly
        snowman.style.animation = 'none';
        snowman.offsetHeight;
        snowman.style.animation = 'snowmanBounce 1s ease-in-out';
        
        setTimeout(() => {
            snowman.style.animation = '';
        }, 1000);
    }

    startSnowmanIdleAnimation() {
        const snowman = document.getElementById('snowman');
        
        // Add subtle breathing animation
        setInterval(() => {
            snowman.style.transform = 'scale(1.02)';
            setTimeout(() => {
                snowman.style.transform = 'scale(1)';
            }, 1000);
        }, 3000);
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        
        if (this.isAnimating) {
            this.startContinuousAnimations();
        } else {
            this.stopContinuousAnimations();
        }
    }

    startContinuousAnimations() {
        // Start continuous snowfall
        document.querySelector('.snow-particles').style.animationPlayState = 'running';
        
        // Start continuous arm waving
        document.querySelector('.left-arm').style.animation = 'armWave 1s ease-in-out infinite';
    }

    stopContinuousAnimations() {
        // Stop continuous snowfall
        document.querySelector('.snow-particles').style.animationPlayState = 'paused';
        
        // Stop continuous arm waving
        document.querySelector('.left-arm').style.animation = '';
    }

    updateDisplay() {
        document.getElementById('personCount').textContent = `People detected: ${this.personCount}`;
        document.getElementById('position').textContent = `Position: ${this.personPosition}`;
        document.getElementById('demandLevel').textContent = `Demand: ${this.demandLevel}`;
        document.getElementById('juiceType').textContent = `Current: ${this.currentJuice.charAt(0).toUpperCase() + this.currentJuice.slice(1)} Juice`;
        document.getElementById('iceLevel').textContent = `Ice: ${this.iceLevel}`;
        document.getElementById('sodaLevel').textContent = `Soda: ${this.sodaLevel}`;
    }

    playSound(type) {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        switch(type) {
            case 'press':
                this.createPressSound(audioContext);
                break;
            case 'juice':
                this.createJuiceSound(audioContext);
                break;
        }
    }

    createPressSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    createJuiceSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes snowmanBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes bubbleRise {
        0% { 
            transform: translateY(0) scale(0);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% { 
            transform: translateY(-60px) scale(1);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SnowmanJuiceMachine();
});