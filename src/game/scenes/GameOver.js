import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x0f0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(550, 384, 'Round Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        //this.add.text(550, 430, `Winner: ${winner})

        const Button = this.add.dom(600, 400).createFromHTML(`
            <style>
                #startButton {
                    font-size: 28px;
                    color: #000000; /* Initial text color */
                    background-color: #FFFFFF; /* Initial background color */
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px; /* Rounded corners */
                    cursor: pointer;
                    transition: all 0.3s ease; /* Smooth transition for hover */
                }

                #startButton:hover {
                    color: #FFFFFF; /* Text color on hover */
                    background-color: #f38b1d; /* Background color on hover */
                }
            </style>
            <button id="startButton">GO!</button>
        `);

        Button.addListener('click');
        Button.on('click', () => {
            this.changeScene
        })

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('Game');
    }
}
