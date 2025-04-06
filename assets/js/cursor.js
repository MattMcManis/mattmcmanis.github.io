window.addEventListener("DOMContentLoaded", function () {
    // Get the canvas element and context
    const canvas = document.getElementById('cursorCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Define drawing properties
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // *** COLOR CONFIGURATION ***
    const colorConfig = {
        // Main trail colors
        trailStartColor: 'rgba(255, 255, 255, 1)', // Core/Head of trail
        trailEndColor: 'rgba(255, 255, 255, 1)',   // Tail end of trail
        
        // Glow colors
        glowColor: 'rgba(255, 255, 212, 0.8)', // Yellowish
        
        // Sparkle colors
        sparkleColors: [
            'rgba(255, 255, 255, 1)', // White
            'rgba(255, 240, 180, 1)', // Light yellow
            'rgba(255, 220, 150, 1)', // Golden
            'rgba(220, 220, 255, 1)'  // Pale blue
        ]
    };
    // *** END COLOR CONFIGURATION ***

    // Points array to store cursor positions
    let points = [];
    const maxPoints = 150; // Increased for an even longer trail
    
    // Sparkle particles array
    let sparkles = [];
    
    // Mouse tracking
    let isMouseOnCanvas = false;
    let mouseSpeed = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastMouseTime = 0;
    
    // Interpolation settings
    const interpolationEnabled = true;
    const maxSegmentLength = 5; // Maximum distance between points before interpolation

    // Track mouse movement with higher precision using pointer events
    canvas.addEventListener('pointermove', handleMouseMove);
    
    // Fallback to mousemove for browsers that don't support pointer events
    canvas.addEventListener('mousemove', handleMouseMove);
    
    function handleMouseMove(e) {
        const currentTime = performance.now();
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        
        if (!isMouseOnCanvas) {
            isMouseOnCanvas = true;
            points = []; // Reset points when mouse enters after leaving
        }
        
        // Calculate mouse speed
        if (lastMouseTime > 0) {
            const dx = mouseX - lastMouseX;
            const dy = mouseY - lastMouseY;
            const dt = currentTime - lastMouseTime;
            
            if (dt > 0) { // Avoid division by zero
                mouseSpeed = Math.sqrt(dx*dx + dy*dy) / dt * 10; // Scale factor
                mouseSpeed = Math.min(mouseSpeed, 5); // Cap the speed
                
                // Interpolate points if moving fast to ensure a continuous line
                if (interpolationEnabled && Math.sqrt(dx*dx + dy*dy) > maxSegmentLength) {
                    const segments = Math.ceil(Math.sqrt(dx*dx + dy*dy) / maxSegmentLength);
                    
                    for (let i = 1; i <= segments; i++) {
                        const ratio = i / segments;
                        const interpX = lastMouseX + dx * ratio;
                        const interpY = lastMouseY + dy * ratio;
                        
                        // Only generate sparkles at the actual cursor position (not for interpolated points)
                        if (i === segments) {
                            addPoint(interpX, interpY, currentTime - (1 - ratio) * dt, mouseSpeed, true);
                        } else {
                            addPoint(interpX, interpY, currentTime - (1 - ratio) * dt, mouseSpeed, false);
                        }
                    }
                } else {
                    // Just add the current point if moving slowly or interpolation is disabled
                    addPoint(mouseX, mouseY, currentTime, mouseSpeed, true);
                }
            }
        } else {
            // First point with no speed calculation
            addPoint(mouseX, mouseY, currentTime, 0, true);
        }
        
        // Update mouse position and time for next calculation
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        lastMouseTime = currentTime;
    }
    
    function addPoint(x, y, time, speed, generateSparkles) {
        // Add current point with speed information
        points.push({
            x: x,
            y: y,
            opacity: 1,
            width: 3 + speed, // Thickness based on speed
            time: time
        });
        
        // Generate sparkles based on speed, but only for actual cursor positions
        if (generateSparkles && speed > 0.5) {
            const sparkleCount = Math.floor(speed * 2); // More sparkles when moving faster
            for (let i = 0; i < sparkleCount; i++) {
                // Random offset from cursor position - tighter distribution
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 10 * speed; // Reduced from 20 to 10
                
                sparkles.push({
                    x: x + Math.cos(angle) * distance,
                    y: y + Math.sin(angle) * distance,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.9 + 0.1,
                    speed: {
                        x: (Math.random() - 0.5) * 1.5, // Reduced speed range for tighter distribution
                        y: (Math.random() - 0.5) * 1.5
                    },
                    color: getSparkleColor(),
                    decay: Math.random() * 0.03 + 0.01
                });
            }
        }
        
        // Limit the number of points
        while (points.length > maxPoints) {
            points.shift(); // Remove oldest point
        }
    }

    // Function to generate random sparkle colors
    function getSparkleColor() {
        return colorConfig.sparkleColors[Math.floor(Math.random() * colorConfig.sparkleColors.length)];
    }

    // Handle mouse leaving the canvas
    canvas.addEventListener('mouseleave', () => {
        isMouseOnCanvas = false;
    });
    
    canvas.addEventListener('pointerleave', () => {
        isMouseOnCanvas = false;
    });

    // Clear the canvas on right-click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        points = []; // Clear all points
        sparkles = []; // Clear all sparkles
    });

    // Function to draw a smooth curve through points
    function drawSmoothCurve(points) {
        if (points.length < 2) return;
        
        // Draw a more solid fill first for base thickness
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        // Use a smoother curve approach for the entire path
        for (let i = 1; i < points.length; i++) {
            const current = points[i];
            const previous = points[i - 1];
            
            // Use a simple average for control points when interpolating between segments
            if (i === 1) {
                ctx.lineTo(current.x, current.y);
            } else {
                const previous2 = points[i - 2];
                
                // Calculate control points for a smoother curve
                const cp1x = previous.x + (current.x - previous2.x) * 0.2;
                const cp1y = previous.y + (current.y - previous2.y) * 0.2;
                
                ctx.quadraticCurveTo(cp1x, cp1y, current.x, current.y);
            }
        }
        
        // Draw solid base with low opacity
        ctx.lineWidth = 4; // Slightly thicker than the visible trail
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
        
        // Draw main trail with gradient effect
        for (let i = 1; i < points.length; i++) {
            const currentPoint = points[i];
            const prevPoint = points[i - 1];
            
            // Calculate control points for smooth curves
            let cp1x, cp1y, cp2x, cp2y;
            
            if (i > 1 && i < points.length - 1) {
                // Use surrounding points to calculate control points
                const prevPrevPoint = points[i - 2];
                const nextPoint = points[i + 1];
                
                // Tension factor (0-1) - lower for smoother curves
                const tension = 0.15;
                
                // Calculate control points based on surrounding points
                cp1x = prevPoint.x + (currentPoint.x - prevPrevPoint.x) * tension;
                cp1y = prevPoint.y + (currentPoint.y - prevPrevPoint.y) * tension;
                cp2x = currentPoint.x - (nextPoint.x - prevPoint.x) * tension;
                cp2y = currentPoint.y - (nextPoint.y - prevPoint.y) * tension;
            } else {
                // Simpler control points for end segments
                cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
                cp1y = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.5;
                cp2x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
                cp2y = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.5;
            }
            
            // Calculate opacity and width based on position and point age
            // Slower fade rate for longer trail
            const opacityFactor = (i / points.length) * currentPoint.opacity;
            const widthFactor = currentPoint.width * Math.pow((i / points.length), 0.5); // Use square root to fade width more gradually
            
            // Create a gradient for this segment
            const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y);
            
            // Extract the base colors and apply opacity
            const startColor = colorConfig.trailStartColor.replace('1)', `${opacityFactor * 0.7})`); // Increased minimum opacity
            const endColor = colorConfig.trailEndColor.replace('1)', `${opacityFactor})`);
            
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);
            
            // Draw the curve segment
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentPoint.x, currentPoint.y);
            ctx.lineWidth = widthFactor;
            ctx.strokeStyle = gradient;
            
            // Add glow effect proportional to the speed
            const glowAmount = Math.min(20, 10 + widthFactor * 2);
            ctx.shadowBlur = glowAmount;
            ctx.shadowColor = colorConfig.glowColor;
            
            ctx.stroke();
        }
        
        // Reset shadow for other drawing operations
        ctx.shadowBlur = 0;
    }
    
    // Function to draw sparkles
    function drawSparkles() {
        sparkles.forEach(sparkle => {
            ctx.beginPath();
            
            // Random star shape with varying rays
            const rays = Math.floor(Math.random() * 3) + 4; // 4-6 rays
            const outerRadius = sparkle.size;
            const innerRadius = sparkle.size * 0.4;
            
            // Draw a star shape
            for (let i = 0; i < rays * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI * 2 * i) / (rays * 2);
                const x = sparkle.x + radius * Math.cos(angle);
                const y = sparkle.y + radius * Math.sin(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            
            // Add glow effect to sparkles
            ctx.shadowBlur = sparkle.size * 3;
            ctx.shadowColor = sparkle.color;
            
            // Fill with color and opacity
            const fillColor = sparkle.color.replace('1)', `${sparkle.opacity})`);
            ctx.fillStyle = fillColor;
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        });
    }

    // Update using requestAnimationFrame
    let lastFrameTime = 0;
    const targetFPS = 60; // Target 60 FPS (16.67ms per frame)
    const frameInterval = 1000 / targetFPS;
    
    function update(timestamp) {
        // Throttle updates to target FPS
        if (timestamp - lastFrameTime < frameInterval) {
            requestAnimationFrame(update);
            return;
        }
        
        lastFrameTime = timestamp;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update main trail points
        const currentTime = performance.now();
        points.forEach(point => {
            // Fade based on time elapsed
            const age = (currentTime - point.time) / 1000; // Age in seconds
            point.opacity = Math.max(0, 1 - age * 1.6); // Slower fade rate (0.8 → 0.6)
        });
        
        // Remove fully faded points
        points = points.filter(point => point.opacity > 0);
        
        // Update sparkles
        sparkles.forEach(sparkle => {
            // Move sparkle
            sparkle.x += sparkle.speed.x;
            sparkle.y += sparkle.speed.y;
            
            // Add some random movement - reduced for tighter distribution
            sparkle.speed.x += (Math.random() - 0.5) * 0.15;
            sparkle.speed.y += (Math.random() - 0.5) * 0.15;
            
            // Slow down over time
            sparkle.speed.x *= 0.97;
            sparkle.speed.y *= 0.97;
            
            // Fade out
            sparkle.opacity -= sparkle.decay;
            
            // Slowly reduce size
            sparkle.size *= 0.99;
        });
        
        // Remove faded sparkles
        sparkles = sparkles.filter(sparkle => sparkle.opacity > 0);
        
        // Draw the main trail curve
        drawSmoothCurve(points);
        
        // Draw sparkles
        drawSparkles();
        
        // Continue the animation
        requestAnimationFrame(update);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Start the animation loop
    requestAnimationFrame(update);
});
