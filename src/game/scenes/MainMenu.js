import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import axios from 'axios';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.add.image(512, 384, 'blured');

        const storedUsername = localStorage.getItem('playerUsername');
        const startButton = this.add.dom(600, 400).createFromHTML(`
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
            <button id="startButton">Start Game</button>
        `);
        startButton.addListener('click');

        if (storedUsername) {
            this.add.text(600, 300, `Welcome back, ${storedUsername}!`, {
                fontSize: '32px',
                fill: '#FFFFFF',
            }).setOrigin(0.5, 0.5);

            startButton.on('click', () => {
                axios.post(`https://server-pearl-hunters.onrender.com/users/login`, { username: storedUsername })
                .then(response => {
                    //alert(response.data.message); 
                    this.scene.start('Game');
                    startButton.destroy();
                })
                .catch(error => {
                    alert('Failed to connect to server. Please try again later.');
                });
            });

        } else {
            this.add.text(600, 250, 'Enter Your Username', {
                fontSize: '32px',
                fill: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5, 0.5);

            const usernameInput = this.add.dom(600, 300).createFromHTML(`
                <input type="text" name="username" id="username" placeholder="Username" 
                       style="font-size: 24px; padding: 10px; width: 200px; text-align: center;">
            `);

            startButton.on('click', () => {
                const username = usernameInput.getChildByID('username').value.trim();

                if (username) {
                    axios.post(`https://server-pearl-hunters.onrender.com/users/register`, { username })
                        .then(response => {
                            localStorage.setItem('playerUsername', username);
                            //alert(response.data.message);
                            this.scene.start('Game');
                            usernameInput.destroy();
                            startButton.destroy();
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 400) {
                                alert('Username already exists. Please choose a different one.');
                            } else {
                                alert('Failed to connect to server. Please try again later.');
                            }
                        });
                } else {
                    alert('Please enter a username.');
                }
            });
        }

        EventBus.emit('current-scene-ready', this);
    }

    createStartButton(storedUsername) {
        
    }
}
