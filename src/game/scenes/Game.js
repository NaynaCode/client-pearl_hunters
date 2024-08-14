import io from 'socket.io-client';
import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.players = {}; // To store all the players
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.add.image(512, 384, 'background');

        // Retrieve the username from local storage
        const username = localStorage.getItem('playerUsername');

        // Display the username at the top-left corner of the screen
        this.add.text(950, 30, `Player: ${username}`, {
            fontSize: '24px',
            fill: '#FFF',
            align: 'left'
        });

        // Connect to the WebSocket server
        this.socket = io('http://localhost:3000');

        // Emit a "new-player" event to the server with the player's initial data
        this.socket.emit('new-player', {
            username,
            x: 700,
            y: 500
        });

        // Handle receiving updates for all players
        this.socket.on('update-players', (onlinePlayers) => {
            this.updatePlayers(onlinePlayers);
        });

        // Initialize seashell collection and other game elements
        this.initializeGameElements();

        // Create the player's sprite and animations
        const player = this.createPlayer(700, 500, 'player', username);
        this.players[this.socket.id] = player;

        // Add pointer movement logic
        this.setupPointerMovement(player);

        // Listen for player movement and update other clients
        this.socket.on('player-move', (moveData) => {
            this.updatePlayerMovement(moveData);
        });

        EventBus.emit('current-scene-ready', this);
    }

    initializeGameElements() {
        var collisionCounter = 1;

        const transparentImages = this.physics.add.staticGroup();
        // ... (rest of your transparentImages creation code)

        const market = this.physics.add.image(323, 360, 'market').setCircle(30, 20, 40).setImmovable(true);
        const jeweller = this.physics.add.image(760, 325, 'jeweller').setCircle(50, 0, 40).setImmovable(true);
        const pearlHunter = this.physics.add.image(857, 495, 'pearlHunter').setCircle(50, 30, 50).setImmovable(true);

        this.physics.add.image(50, 50, 'shell');
        this.physics.add.image(50, 80, 'pearl');
        this.physics.add.image(50, 110, 'necklace');
        this.physics.add.image(50, 140, 'coin');

        // Initialize other game elements like seashells, counters, etc.
        // ... (rest of your seashells and counters initialization code)
    }

    createPlayer(x, y, spriteKey, username) {
        const player = this.physics.add.sprite(x, y, spriteKey);
        player.body.setCollideWorldBounds(true, 1, 1);
        player.body.setCircle(10, 20, 35);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 5, end: 8 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 4, end: 4 }),
            frameRate: 8,
            repeat: -1,
        });

        player.anims.play('idle', true);

        player.username = username; // Store the username in the player object

        return player;
    }

    setupPointerMovement(player) {
        let isMoving = false;

        this.input.on('pointerdown', (pointer) => {
            if (isMoving) return;

            const SPEED = 200; // Speed in pixels per second
            const distance = Phaser.Math.Distance.Between(player.x, player.y, pointer.x, pointer.y);
            const duration = (distance / SPEED) * 1000; // Duration in milliseconds

            if (pointer.x < player.x) {
                player.anims.play('left', true);
            } else if (pointer.x > player.x) {
                player.anims.play('right', true);
            }

            this.tweens.add({
                targets: player,
                x: pointer.x,
                y: pointer.y,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    player.anims.play('idle', true);
                    isMoving = false;

                    // Emit player movement to the server
                    this.socket.emit('player-move', {
                        id: this.socket.id,
                        x: player.x,
                        y: player.y
                    });
                }
            });

            isMoving = true;
        });
    }

    updatePlayers(onlinePlayers) {
        Object.keys(onlinePlayers).forEach((id) => {
            const playerData = onlinePlayers[id];

            if (this.players[id]) {
                // Update existing player's position
                this.players[id].setPosition(playerData.x, playerData.y);
            } else {
                // Create a new player sprite if it doesn't exist
                const newPlayer = this.createPlayer(playerData.x, playerData.y, 'player', playerData.username);
                this.players[id] = newPlayer;
            }
        });

        // Remove players who have disconnected
        Object.keys(this.players).forEach((id) => {
            if (!onlinePlayers[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }
        });
    }

    updatePlayerMovement(moveData) {
        if (this.players[moveData.id]) {
            this.players[moveData.id].setPosition(moveData.x, moveData.y);
        }
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
