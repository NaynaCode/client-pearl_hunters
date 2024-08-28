import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.image(512, 384, 'background');
    }
    preload ()
    {
        
        this.load.setPath('assets');

        this.load.spritesheet('player', 'cikica2.png', { frameWidth: 60, frameHeight: 60 });
        this.load.image('transparent', 'transparent.png');
        this.load.image('market', 'market.png');
        this.load.image('jeweller', 'jeweller.png');
        this.load.image('pearlHunter', 'pearlHunter.png');
        this.load.image('shell1', 'shell1.png');
        this.load.image('shell2', 'shell2.png');
        this.load.image('shell3', 'shell3.png');
        this.load.image('shell', 'shell.png');
        this.load.image('pearl', 'pearl.png');
        this.load.image('necklace', 'necklace.png');
        this.load.image('coin', 'coin.png');
        this.load.image('blured', 'bgBlur.png');
        this.load.image('leaderboard', 'leaderboard.png');

        this.load.audio('collect', 'collect.wav');
        this.load.audio('wave', 'wave.wav');

        this.load.spritesheet('waveS', 'wave-sprite.png', { frameWidth: 400, frameHeight: 100 });
    }

    create ()
    {
        
        this.scene.start('MainMenu');
    }
}
