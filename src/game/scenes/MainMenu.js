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

            // Check if the input field is properly created
            const usernameField = usernameInput.getChildByID('username');
            if (!usernameField) {
                console.error('Username input field could not be found.');
                return; // Exit if the input field is not found
            }

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
                console.log('Button clicked'); // Debugging log
                // Get the entered username from the input field
                const username = usernameField.value.trim();

                if (username) {
                    // Store the username in local storage
                    localStorage.setItem('playerUsername', username);
                    // Disable the button to prevent multiple clicks
                    startButton.setVisible(false);

                    // Make a POST request to the server when starting the game
                    axios.post('http://localhost:3000/api/players', { username })
                        .then(response => {
                            console.log(response.data);
                            alert(response.data.message); // Display welcome message
                        })
                        .catch(error => {
                            console.error('Error sending data:', error);
                            alert('Failed to connect to server. Please try again later.');
                        });

                    // Start the Game scene
                    this.scene.start('Game');
                    // Clean up the DOM elements
                    usernameInput.destroy();
                    startButton.destroy();
                } else {
                    // Show an error if the username is empty
                    alert('Please enter a username.');
                }
            });
        }

        EventBus.emit('current-scene-ready', this);
    }

    createStartButton(username) {
        // Create a "Start Game" button
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
            console.log('Button clicked'); // Debugging log
            
            // Send username to server and receive welcome message
            axios.post('http://localhost:3000/api/players', { username })
                .then(response => {
                    console.log(response.data);
                    alert(response.data.message); // Display welcome message
                })
                .catch(error => {
                    console.error('Error sending data:', error);
                    alert('Failed to connect to server. Please try again later.');
                });

            // Start the Game scene
            this.scene.start('Game');
            // Clean up the DOM elements
            startButton.destroy();
        });
    }
}
