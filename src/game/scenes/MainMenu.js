import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import axios from 'axios'; // Import Axios for HTTP requests

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.add.image(512, 384, 'blured');

        // Check if a username is already stored
        const storedUsername = localStorage.getItem('playerUsername');

        if (storedUsername) {
            // Display a welcome back message if a username is stored
            this.add.text(600, 300, `Welcome back, ${storedUsername}!`, {
                fontSize: '32px',
                fill: '#FFFFFF',
            }).setOrigin(0.5, 0.5);

            // Create a "Start Game" button for returning users
            this.createStartButton(storedUsername);
        } else {
            // Display the username input field for new users
            this.add.text(600, 250, 'Enter Your Username', {
                fontSize: '32px',
                fill: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5, 0.5);

            // Create an input field for the username using the DOM element
            const usernameInput = this.add.dom(600, 300).createFromHTML(`
                <input type="text" name="username" id="username" placeholder="Username" 
                       style="font-size: 24px; padding: 10px; width: 200px; text-align: center;">
            `);

            // Create a button to start the game for new users
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

            // Add a click event listener to the button
            startButton.addListener('click');
            startButton.on('click', () => {
                const username = usernameInput.getChildByID('username').value.trim();

                if (username) {
                    // Make a POST request to the server to add the username
                    axios.post(`${process.env.SERVER_URL}/users/register`, { username })
                        .then(response => {
                            // Store the username in local storage upon successful registration
                            localStorage.setItem('playerUsername', username);
                            alert(response.data.message);
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
        // Send the stored username to the server to check its status
        axios.post(`${process.env.SERVER_URL}/users/login`, { username: storedUsername })
            .then(response => {
                alert(response.data.message); // Display the welcome message
                this.scene.start('Game');
            })
            .catch(error => {
                alert('Failed to connect to server. Please try again later.');
            });
    }
}
