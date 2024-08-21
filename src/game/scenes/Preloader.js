import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
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
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
