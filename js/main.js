// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
	// Create and start game
	const game = new Game();

	// Add some CSS styles for UI elements
	const style = document.createElement("style");
	style.textContent = `
        .ui-panel {
            font-family: 'Arial', sans-serif;
            color: #0ff;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border: 1px solid #0ff;
            border-radius: 5px;
        }
        
        .warning {
            color: #f00;
            animation: pulse 1s infinite;
        }
        
        .game-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            opacity: 0;
            transition: opacity 0.5s;
        }
        
        .game-message.visible {
            opacity: 1;
        }
        
        .damage-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            color: #f00;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
            pointer-events: none;
            transition: transform 1s, opacity 1s;
        }
        
        .damage-indicator.fade-out {
            transform: translate(-50%, -100px) !important;
            opacity: 0;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
	document.head.appendChild(style);
});
