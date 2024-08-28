import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        this.load.image('background', 'assets/bg.PNG');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
