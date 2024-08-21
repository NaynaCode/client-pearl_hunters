import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import io from 'socket.io-client';
import axios from 'axios';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const socket = io('https://server-pearl-hunters.onrender.com'); // Connect to the server

        this.cameras.main.setBackgroundColor(0x00ff00);
        this.add.image(512, 384, 'background');

        this.backgroundWaves = this.sound.add('wave', { loop: true });
        this.backgroundWaves.setVolume(0.5);
        this.backgroundWaves.play();

        this.collectSound = this.sound.add('collect');
        this.collectSound.setVolume(0.3);

        this.add.image(1070, 130, 'leaderboard').setScale(1.5);

        this.timerText = this.add.text(600, 30, `Time: 0:00`, { fontSize: '24px', fill: '#fff' });

        

        // Retrieve the username from local storage
        const username = localStorage.getItem('playerUsername');
        socket.emit('requestLeaderboard');

        // Display the username at the top-left corner of the screen
        this.add.text(30, 35, `Player: ${username}`, {
            fontSize: '24px',
            fill: '#FFF',
            align: 'left'
        });

        // Create a player group
        this.players = this.physics.add.group(); // To keep track of all players

        var collisionCounter = 1;

        const transparentImages = this.physics.add.staticGroup();

        transparentImages.create(-80, 530, 'transparent').setCircle(110);
        transparentImages.create(-40, 430, 'transparent').setCircle(70);
        transparentImages.create(80, 360, 'transparent').setCircle(70);
        transparentImages.create(130, 400, 'transparent').setCircle(70);
        transparentImages.create(210, 330, 'transparent').setCircle(50);
        transparentImages.create(260, 280, 'transparent').setCircle(50);
        transparentImages.create(310, 270, 'transparent').setCircle(50);
        transparentImages.create(350, 190, 'transparent').setCircle(70);
        transparentImages.create(420, -120, 'transparent').setCircle(200);
        transparentImages.create(630, 220, 'transparent').setCircle(80);
        transparentImages.create(750, 200, 'transparent').setCircle(80);
        transparentImages.create(840, 290, 'transparent').setCircle(80);
        transparentImages.create(770, 390, 'transparent').setCircle(60);
        transparentImages.create(770, 480, 'transparent').setCircle(20);
        transparentImages.create(870, 460, 'transparent').setCircle(70);
        transparentImages.create(760, 580, 'transparent').setCircle(20);
        transparentImages.create(760, 510, 'transparent').setCircle(200);

        const market = this.physics.add.image(323, 360, 'market').setCircle(30, 20, 40).setImmovable(true);
        const jeweller = this.physics.add.image(760, 325, 'jeweller').setCircle(50, 0, 40).setImmovable(true);
        const pearlHunter = this.physics.add.image(857, 495, 'pearlHunter').setCircle(50, 0, 20).setImmovable(true);

        this.physics.add.image(40, 80, 'shell');
        this.physics.add.image(40, 110, 'pearl');
        this.physics.add.image(40, 140, 'necklace');
        this.physics.add.image(40, 170, 'coin');

        // Create a group for seashells
        const seashells = this.physics.add.group({
            key: ['shell1', 'shell2', 'shell3'], // Array of keys for different seashell sprites
            repeat: 1, // Number of seashells to create
            //setScale: { x: 0.5, y: 0.5 }, // Optional scaling
            visible: false, // Start invisible to use pool
            active: false // Start inactive
        });

        seashells.children.iterate((seashell) => {
            seashell.body.setCircle(10, 5, 10);
            seashell.body.setCollideWorldBounds(true, 1, 1);
        });

        // **Enhancement: seaShells System**
        let seaShells;
        let pearls;
        let necklaces;
        let coins;
        let seaShellsText, pearlsText, necklacesText, coinsText;
        
        axios.post(`https://server-pearl-hunters.onrender.com/userData`, { username })
            .then(response => {
                // Extract the user data from the response
                const userData = response.data.user;
                seaShells = userData.shells;
                pearls = userData.pearls;
                necklaces = userData.necklaces;
                coins = userData.coins;
        
                // Initialize the text objects with the fetched data
                seaShellsText = this.add.text(70, 70, seaShells + '/10', { fontSize: '24px', fill: '#FFF' });
                pearlsText = this.add.text(70, 100, pearls, { fontSize: '24px', fill: '#FFF' });
                necklacesText = this.add.text(70, 130, necklaces, { fontSize: '24px', fill: '#FFF' });
                coinsText = this.add.text(70, 160, coins, { fontSize: '24px', fill: '#FFF' });
            })
            .catch(error => {
                alert('Error fetching user data: ' + error);
            });
        

        const updateSeaShells = () => {
            if (seaShells<10) {
                seaShells += 1; // Or any value you want
                seaShellsText.setText(seaShells + '/10');

                const username = localStorage.getItem('playerUsername');
                socket.emit('updateShells', { username, shells: seaShells});
            }
        };

        const updatePearls = () => {
            pearls += seaShells;
            pearlsText.setText(pearls);
            seaShells = 0;
            seaShellsText.setText(seaShells + '/10'); 

            const username = localStorage.getItem('playerUsername');
            socket.emit('updatePearls', { username, shells: seaShells, pearls});
        };

        const updateNecklaces = () => {
            necklaces += Math.floor(pearls / 2); 
            necklacesText.setText(necklaces);
            pearls = pearls % 2; 
            pearlsText.setText(pearls); 

            const username = localStorage.getItem('playerUsername');
            socket.emit('updateNecklaces', { username, pearls, necklaces});
        };
        
        const updateCoins = () => {
            if (necklaces > 0) {
                coins += 100 * necklaces;
                coinsText.setText(coins);
                necklaces = 0;
                necklacesText.setText(necklaces);

                const username = localStorage.getItem('playerUsername');
                socket.emit('updateCoins', { username, necklaces, coins});
                socket.emit('requestLeaderboard');

        // Listen for the leaderboard data from the server
        
            }    
        }

        const leaderboardText = [];

        socket.on('leaderboardData', (response) => {
            if (response.error) {
                alert('Error fetching leaderboard data: ' + response.error);
            } else {
                const users = response.users;

                // Clear the previous leaderboard display
                leaderboardText.forEach(text => text.destroy());
                leaderboardText.length = 0; // Reset the array

                this.add.text(1000, 35, 'Leaderboard:', { fontSize: '20px', fill: '#000' });

                users.forEach((user, index) => {
                    if (index < 5) {
                        const rank = index + 1;
                        const userText = `${rank}. ${user.username} - ${user.coins}`;
                        const text = this.add.text(1000, 95 + index * 30, userText, { fontSize: '16px', fill: '#000' });
                        leaderboardText.push(text);
                    }
                });
                
            }
        });

        // Function to spawn a seashell at a random position
        function spawnSeashell() {
            const h = 500; // X center of the oval
            const k = 660; // Y center of the oval
            const a = 250; // Horizontal radius (semi-major axis)
            const b = 50; // Vertical radius (semi-minor axis)


            // Generate a random angle and radius
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const radius = Math.sqrt(Phaser.Math.FloatBetween(0, 1)); // Normalize distance


            // Calculate the position within the oval
            const x = h + radius * a * Math.cos(angle);
            const y = k + radius * b * Math.sin(angle);

            // Get a random seashell from the pool
            const seashell = seashells.getFirstDead(false, x, y);

            if (seashell) {
                if (collisionCounter < 1)
                    collisionCounter = 1;

                seashell.setActive(true);
                seashell.setVisible(true);

                // Randomly select a texture from the array
                const textures = ['shell1', 'shell2', 'shell3'];
                const texture = Phaser.Utils.Array.GetRandom(textures);
                seashell.setTexture(texture);

                // Set a random position within the game bounds
                seashell.setPosition(x, y);
                seashell.setCircle(10); // Set circle physics


                // You can also add any other properties or animations here if needed
            }
        }

        // Timer event to spawn seashells at random intervals
        this.time.addEvent({
            delay: Phaser.Math.Between(500, 600), // Random interval between spawns
            callback: spawnSeashell,
            callbackScope: this,
            loop: true
        });

        const waveS = this.physics.add.sprite(500, 670, 'waveS');
        waveS.setScale(1.7).setAlpha(0.5);
        this.anims.create({
            key: 'waveAnimation',
            frames: this.anims.generateFrameNumbers('waveS', { start: 0, end: 2 }),
            frameRate: 1.5,
            repeat: -1,
        });
        waveS.play('waveAnimation');

        const player = this.physics.add.sprite(700, 500, 'player');
        player.body.setCollideWorldBounds(true, 1, 1);
        player.body.setCircle(10, 20, 35);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
            frameRate: 8,
            repeat: -1,
        });

        player.anims.play('idle', true);

        let isMoving = false; // Track whether the player is moving

        // Add collision between player and transparent image
        this.physics.add.collider(player, transparentImages, () => {
            // Stop the player's tween movement on collision
            if (isMoving) {
                this.tweens.killTweensOf(player);
                player.anims.play('idle', true);
                isMoving = false;
            }
        });

        this.physics.add.collider(player, seashells, (player, seashell) => {
            if (seashell.active && seaShells<10) {
                console.log('Collision detected');
                this.collectSound.play();
                seashell.setActive(false);
                seashell.setVisible(false);
                updateSeaShells();
            }
        });
        

        this.physics.add.collider(player, pearlHunter, () => {
            updatePearls();
        }); 

        this.physics.add.collider(player, jeweller, () => {
            updateNecklaces();
        }); 

        this.physics.add.collider(player, market, () => {
            updateCoins();
            
        }); 

        this.input.on('pointerdown', (pointer) => {
            if (isMoving) return;  //Prevent new movement if already moving
            const SPEED = 200; // Speed in pixels per second

            // Calculate the distance between the player and the pointer
            const distance = Phaser.Math.Distance.Between(player.x, player.y, pointer.x, pointer.y);

            // Calculate duration to maintain constant speed
            const duration = (distance / SPEED) * 1000; // Duration in milliseconds

            // Determine animation based on pointer position
            if (pointer.x < player.x) {
                player.anims.play('left', true);
            } else if (pointer.x > player.x) {
                player.anims.play('right', true);
            }

            // Tween the player's position to the pointer's position
            this.tweens.add({
                targets: player,
                x: pointer.x,
                y: pointer.y,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    player.anims.play('idle', true);
                    isMoving = false; // Allow new movement
                    socket.emit('playerMovement', { x: player.x, y: player.y });
                }

                // Emit the player's new position after movement
            
            });
            isMoving = true; // Mark the player as moving
        }); 

        socket.on('newPlayer', (data) => {
            console.log('New player connected:', data.id);
            // Create a new player sprite
            const newPlayer = this.physics.add.sprite(700, 500, 'player'); // Use default position or sync with server data
            newPlayer.id = data.id;
            newPlayer.body.setCollideWorldBounds(true, 1, 1);
            newPlayer.body.setCircle(10, 20, 35);
            this.players.add(newPlayer);
            newPlayer.anims.play('idle', true);
            socket.emit('requestLeaderboard');
        });
        
        // Handle player movement
        socket.on('playerMovement', (data) => {
            console.log('Player movement from server:', data);
        
            if (!this.players) {
                console.error('Players group is not initialized');
                return;
            }
        
            let otherPlayer = this.players.getChildren().find(p => p.id === data.id);
            if (otherPlayer) {
                const previousX = otherPlayer.x;
                const previousY = otherPlayer.y;
        
                const SPEED = 200; // Speed in pixels per second
                const distance = Phaser.Math.Distance.Between(previousX, previousY, data.x, data.y);
                const duration = (distance / SPEED) * 1000;
        
                if (data.x < previousX) {
                    otherPlayer.anims.play('left', true);
                } else if (data.x > previousX) {
                    otherPlayer.anims.play('right', true);
                }
        
                this.tweens.add({
                    targets: otherPlayer,
                    x: data.x,
                    y: data.y,
                    duration: duration,
                    ease: 'Linear',
                    onComplete: () => {
                        otherPlayer.anims.play('idle', true);
                        isMoving = false;
                    }
                });
            } else {
                // Create a new player sprite
                const newPlayer = this.physics.add.sprite(700, 500, 'player'); // Use default position or sync with server data
                newPlayer.id = data.id;
                newPlayer.body.setCollideWorldBounds(true, 1, 1);
                newPlayer.body.setCircle(10, 20, 35);
                this.players.add(newPlayer);
                newPlayer.anims.play('idle', true);
                socket.emit('requestLeaderboard');
            }
        });

        // Listen for the 'timerUpdate' event from the server
        socket.on('timerUpdate', (time) => {
            // Update the timer text with the synchronized time
            this.timerText.setText(`Time: ${this.formatTime(time)}`);
        });

        socket.on('resetAndChangeScene', (winner) => {
            socket.emit('requestLeaderboard');
            seaShells = 0;
            pearls = 0;
            necklaces = 0;
            coins = 0;
            seaShellsText.setText('0/10'); 
            pearlsText.setText('0'); 
            necklacesText.setText('0'); 
            coinsText.setText('0'); 
            this.scene.pause();
            this.showTransitionScene(winner);
             // Show the transition scene for 5 seconds
             setTimeout(() => {
                this.scene.resume(); // Resume the current scene after 5 seconds
            }, 5000);
        });
        
        // Handle player disconnection
        socket.on('playerDisconnected', (data) => {
            console.log('Player disconnected:', data.id);
            let disconnectedPlayer = this.players.getChildren().find(p => p.id === data.id);
            if (disconnectedPlayer) {
                disconnectedPlayer.destroy(); // Remove the player sprite
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    showTransitionScene(winner) {
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,   // X position (centered)
            this.cameras.main.height / 2,  // Y position (centered)
            this.cameras.main.width,       // Width (full screen)
            this.cameras.main.height,      // Height (full screen)
            0xffa500                      // Orange color (hex code)
        );
        overlay.setAlpha(0.5); // Set the transparency (0.5 = 50% transparent)
        // Implement your scene transition logic here
        const transitionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Round Over! Resetting...',
            { fontSize: '24px', fill: '#fff' }
        );
        transitionText.setOrigin(0.5);

        const winnerText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            `Winner: ${winner.username}`,
            { fontSize: '32px', fill: '#fff' }
        );
        winnerText.setOrigin(0.5);
        
        // Optional: Fade out the text after 5 seconds
        this.tweens.add({
            targets: [transitionText, winnerText, overlay],
            alpha: 0,
            duration: 1000,
            delay: 0,
            onComplete: () => transitionText.destroy()
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const partInSeconds = seconds % 60;
        const formattedSeconds = partInSeconds < 10 ? `0${partInSeconds}` : partInSeconds;
        return `${minutes}:${formattedSeconds}`;
    }
}
