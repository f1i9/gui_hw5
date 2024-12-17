/* 
File: index.js
Project: Scrabble Web App
GUI Assignment: Homework 5
Content: This file contains JavaScript functions for managing the interactive features of a Scrabble web app. The app includes various functionalities for playing Scrabble, including the generation of a game board, letter racks, and word validation. Key features include:
- **Game Setup**: Initializes the Scrabble board and player's letter rack, including the display of special tiles such as double-word and double-letter scores.
- **Drag & Drop**: Allows players to drag and drop letter tiles onto the board, with real-time score calculations and word validation.
- **Word Validation**: Checks if the formed word exists in the dictionary, and updates the score based on valid words and special tiles.
- **Score Calculation**: Calculates the score for the current word, considering special tiles (double-letter, double-word) and updates the total score.
- **Start Over & Next Word**: Provides buttons for starting a new game and moving to the next word.
- **Dynamic Updates**: Updates the display of the remaining tiles, current score, total score, and highest score as the game progresses.
- **Deck Generation**: Generates a random set of letter tiles for the player’s rack from a predefined pool of tiles.
- **Dictionary Lookup**: Validates words formed on the board against a dictionary, allowing players to check the validity of their word.

This code integrates jQuery for enhanced interactivity, including drag-and-drop functionality and real-time updates.

Author: Alireza Jahanban, UMass Lowell Computer Science  
Email: Alireza_Jahanban@student.uml.edu  
Copyright (c) 2024 by Alireza Jahanban. All rights reserved.  
This code is free to use by anyone for business or educational purposes with credit to the author.  
Last updated: December 2024.
*/



// ---------------------------------------------------------------------------
//                          CONFIG
// ---------------------------------------------------------------------------
let doubleWordScore = [3, 13];
let doubleLetterScore = [7, 9];
let bc = 15;
let rc = 7;
let rt = 95;
let hs = 0;
let total_score = 0;


$(async function () {
    setup();
    $('#remaining').html('TILES LEFT: ' + (rt));        
    $('#highest').html('HIGHEST: ' + (hs));   

    // ---------------------------------------------------------------------------
    //                          BUTTON
    // ---------------------------------------------------------------------------
    $("#startOveBtn").click(async function() {
        rt = 95;
        hs = 0;
        total_score = 0;
        $('#remaining').html('TILES LEFT: ' + (rt));        
        $('#highest').html('HIGHEST: ' + (hs));
        $('#total').html('TOTAL: ' + (total_score));
        $('#score').html('SCORE: ' + 0);
        $('#isword').html('VALIDITY: ');
        $('#lookup').html('DICTIONARY: ');     

        await setup();
        $('#warning-message').empty();
    });

    $("#nextWordBtn").click(async function() {

        if (await lookup(getWord().toLowerCase())) {
            rt -= getWord().length;
            $('#remaining').html('TILES LEFT: ' + (rt));        

            if (await extractWordScore() >= hs) {
                hs = await extractWordScore();
            }
            $('#highest').html('HIGHEST: ' + (hs));
            total_score += await extractWordScore();
            $('#total').html('TOTAL: ' + (total_score));
            $('#score').html('SCORE: ' + 0);
            $('#isword').html('VALIDITY: ');
            $('#lookup').html('DICTIONARY: ');  
               
            await setup();
            $('#warning-message').empty();
        } else {
            $('#warning-message').empty();
            $('#warning-message').append('First play a word until the tiles turn green');
        }
    });
});

// ---------------------------------------------------------------------------
//                          SETUP
// ---------------------------------------------------------------------------   
async function setup() {
    // ---------------------------------------------------------------------------
    //                          BOARD
    // ---------------------------------------------------------------------------        
    $('#placeholder').empty();    

    for (let i = 0; i < bc; i++) {
        $('#placeholder').append('<div class="slot"></div>');
    }

    doubleWordScore.forEach(i => {
        $(`#placeholder .slot:nth-child(${i})`).addClass('slot double-word-score');
        // $(`#placeholder .slot:nth-child(${i})`).append('<p id="double-word-score-text">DOUBLE<br>WORD<br>SCORE</p>');
    });

    doubleLetterScore.forEach(i => {
        $(`#placeholder .slot:nth-child(${i})`).addClass('slot double-letter-score');
        // $(`#placeholder .slot:nth-child(${i})`).append('<p id="double-letter-score-text">DOUBLE<br>LETTER<br>SCORE</p>');
    });

    $('.board').css({
        'width': `${5 * bc}vw`,
        'grid-template-columns': `repeat(${bc}, 1fr)`,
    })

    // ---------------------------------------------------------------------------
    //                          RACK
    // ---------------------------------------------------------------------------
    $('#box1').empty();

    for (let i = 0; i < rc; i++) {
        $('#box1').append('<div class="slot rack-slot"></div>');
    }

    var rd = await generateDeck();
    var ls = [];
    
    for (let i = 0; i < rc; i++) {
        ls[i] = await getLetterScore(rd[i]);
    }

    console.log('RD >> ' + rd);
    for (let i = 0; i < rc; i++) {
        $('#box1 .slot').eq(i).append(`<div class="small-box" id="box${rd[i]}"><span class="letter">${rd[i]}</span> <span class="score">${ls[i]}</span></div>`);
    }

    $('.rack').css({
        'width': `${5 * rc}vw`,
        'grid-template-columns': `repeat(${rc}, 1fr)`,
    })

    // ---------------------------------------------------------------------------
    //                       DRAG & DROP
    // ---------------------------------------------------------------------------

    $(".small-box").draggable({
        revert: "invalid", // Revert to the original position if not dropped in a valid droppable
        containment: "body", // Restrict dragging to the body
        stack: ".small-box" // Ensure draggable boxes stack properly
    });

    // Make each slot droppable
    $(".slot").droppable({
        accept: ".small-box", // Accept only small boxes
        tolerance: "intersect", // The draggable must fully fit inside the slot to snap
        drop: async function (event, ui) {

            if ($(this).children(".small-box").length > 0) {
                ui.draggable.draggable("option", "revert", true); // Force the box to revert
                return;
            }


            $(this).append(ui.draggable);

            ui.draggable.css({
                top: 0,
                left: 0
            });

            let slotIndex = $(this).index() + 1;

            if ((doubleLetterScore.includes(slotIndex) || doubleWordScore.includes(slotIndex)) 
                && (!$(this).hasClass('rack-slot'))) {

                ui.draggable.addClass('box-hover');
            } else {
                    ui.draggable.removeClass('box-hover');
                    ui.draggable.removeClass('box-hover');
            }

            if (await lookup(getWord().toLowerCase())) {
                $('#score').html('SCORE: ' + await extractWordScore());      
            } else {
                $('#score').html('SCORE: ');      
            }


            $('#isword').html('VALIDITY: ' + getWord());

            if (await lookup(getWord().toLowerCase())) {
                $('#lookup').html('DICTIONARY:  ' + "✅");
            } else {
                $('#lookup').html('DICTIONARY:  ' + "❌");
            }

            if (await lookup(getWord().toLowerCase())) {
                $('#placeholder').children().each(function() { $(this).children().eq(0).addClass('small-box-green')});
            } else {
                $('#placeholder').children().each(function() { $(this).children().eq(0).removeClass('small-box-green')});
            }

            $('#box1').children().each(function() { $(this).children().eq(0).removeClass('small-box-green')});


            // if ((getWord() !== `getWord() : is NOT contiguous`) && (getWord() === 'getWord() : empty')) {}
            // else {
            //     ui.draggable.draggable("option", "revert", true); // Force the box to revert
            //     return;
            // }

            $('#warning-message').empty();


        }
    });

    }

// ---------------------------------------------------------------------------
//                          extractWordScore
// ---------------------------------------------------------------------------
async function extractWordScore() {
    let score = 0;
    const promises = [];
    let wordMultiplier = 1; 

    $("#placeholder").children().each(async function(index) {
        var letterMultiplier = 1;
        var letter = "";

        letterMultiplier = doubleLetterScore.includes(index + 1) ? 2 : letterMultiplier;

        if ($(this).children().length == 0) {
            letter = " ";
        } else {
            letter = $(this).children().first().children().first().text();
            if (doubleWordScore.includes(index + 1)) { wordMultiplier *= 2; }
        }

        promises.push(getLetterScore(letter).then((letterScore) => {
            score += letterScore * letterMultiplier;
        }));
    });
    
    await Promise.all(promises);

    return score * wordMultiplier;
}

// ---------------------------------------------------------------------------
//                          isWord
// ---------------------------------------------------------------------------
function getWord() {
    let w = "";
    $("#placeholder").each(function() {
        $(this).children().each(function() {
            if ($(this).children().length == 0) {
                w += " ";
            } else {
                w += $(this).children().first().children().first().text();
            }
        });
    });

    // console.log('getWork():' + w.trim() + ';');

    if (w.trim() === "") { return 'getWord() : empty'; }

    if (!w.trim().includes(" ") && !!w.trim().length) {
        console.log(`getWord() : ${w.trim()} is contiguous`)
        return w.trim();
    } else {
        console.log(`getWord() : ${w} is NOT contiguous`)
        return `getWord() : is NOT contiguous`;
    }
}

// ---------------------------------------------------------------------------
//                          generateDeck
// ---------------------------------------------------------------------------
async function generateDeck() {
    try {
        const response = await fetch('./graphics_data/pieces.json');
        const jsonData = await response.json(); // Parse JSON from the response
        const randomHand = generateHand(jsonData);
        console.log(randomHand);
        return randomHand; // Return the random hand to use outside the function
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null; // Return null in case of an error
    }

}

// ---------------------------------------------------------------------------
//                          generateHand
// ---------------------------------------------------------------------------
async function generateHand(data, handSize = 15) {
  const pool = [];

  data.pieces.forEach(tile => {
    for (let i = 0; i < tile.amount; i++) {
      pool.push(tile.letter);
    }
  });

  shuffle(pool);

  return pool.slice(0, handSize);
}

// ---------------------------------------------------------------------------
//                          shuffle
// ---------------------------------------------------------------------------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// ---------------------------------------------------------------------------
//                          getLetterScore
// ---------------------------------------------------------------------------
async function getLetterScore(letter) {
    if (letter.length === 1) {
        try {
            const response = await fetch('./graphics_data/pieces.json');
            const jsonData = await response.json();
    
            let score = 0;
    
            const tile = jsonData.pieces.find(piece => piece.letter === letter);
    
            if (tile) {
                score += tile.value;
            } else {
                // console.log(`Letter ${letter} not found in the tile set.`);
            }
    
            // console.log(`The score of the letter "${letter}" is: ${score}`);
            
            return score;

        } catch (error) {
            console.error('Error loading or parsing the JSON data:', error);
        }
    } else {
        return -1;
    }
}

// ---------------------------------------------------------------------------
//                          lookup
// ---------------------------------------------------------------------------
async function lookup(word) {
    try {

        if (word.length <= 1) { return false; }
        // Fetch the JSON file
        const response = await fetch('./graphics_data/dictionary.json');
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status}`);
        }
        
        // Parse the JSON data
        const jsonData = await response.json();
        
        // Check if the string exists in the array
        const exists = jsonData.includes(word);
        
        // Log the result
        if (exists) {
            console.log(`${word} exists in the JSON data.`);
        } else {
            console.log(`${word} does not exist in the JSON data.`);
        }
        
        return exists; // Return true or false
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}