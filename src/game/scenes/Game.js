import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {
    constructor() {
        super('Game');
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
        const pearlHunter = this.physics.add.image(857, 495, 'pearlHunter').setCircle(50, 30, 50).setImmovable(true);

        this.physics.add.image(50, 50, 'shell');
        this.physics.add.image(50, 80, 'pearl');
        this.physics.add.image(50, 110, 'necklace');
        this.physics.add.image(50, 140, 'coin');

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
        let seaShells = 0;
        let pearls = 0;
        let necklaces = 0;
        let coins = 0;
        const seaShellsText = this.add.text(80, 40, '0/10', { fontSize: '24px', fill: '#FFF' });
        const pearlsText = this.add.text(80, 70, '0', { fontSize: '24px', fill: '#FFF' });
        const necklacesText = this.add.text(80, 100, '0', { fontSize: '24px', fill: '#FFF' });
        const coinsText = this.add.text(80, 130, '0', { fontSize: '24px', fill: '#FFF' });

        const updateseaShells = () => {
            if (seaShells<10) {
                seaShells += 1; // Or any value you want
                seaShellsText.setText(seaShells + '/10');
            }
        };

        const updatePearls = () => {
            pearls += seaShells;
            pearlsText.setText(pearls);
            seaShells = 0;
            seaShellsText.setText(seaShells + '/10'); 
        };

        const updateNecklaces = () => {
            necklaces += Math.floor(pearls / 10); 
            necklacesText.setText(necklaces);
            pearls = pearls % 10; 
            pearlsText.setText(pearls); 
        };
        
        const updateCoins = () => {
            if (necklaces > 1) {
                coins += 100 * necklaces;
                coinsText.setText(coins);
                necklaces -= 2;
                necklacesText.setText(necklaces);
            }    
        }

        // Function to spawn a seashell at a random position
        const spawnSeashell = () => {
            const h = 500; // X center of the oval
            const k = 680; // Y center of the oval
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
                if (collisionCounter<1)
                    collisionCounter=1;

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
        };

        // Timer event to spawn seashells at random intervals
        this.time.addEvent({
            delay: Phaser.Math.Between(500, 600), // Random interval between spawns
            callback: spawnSeashell,
            callbackScope: this,
            loop: true
        });

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
            console.log('Collision detected');
            // Hide and deactivate the seashell on collision
            if (seaShells<10){
                seashell.setActive(false);
                seashell.setVisible(false);
            } else {

            }
            // **Enhancement: Update seaShells**
            if (collisionCounter>0)
                updateseaShells();
            collisionCounter = 0;
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
            if (isMoving) return; // Prevent new movement if already moving
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
                }
            });
            isMoving = true; // Mark the player as moving
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
