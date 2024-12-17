/* 
File: index.js
GUI Assignment: Homework 4
Content: This file contains JavaScript functions for generating, displaying, and managing a multiplication table 
based on user inputs from an HTML form. The `generateTable` function captures minimum and maximum row and column 
values, validates input, and dynamically builds an HTML table containing the products of each cell. The function 
restricts the table size to a maximum difference of 100 rows and columns. 

Additional features include:
- **Clear Fields**: Resets all input fields, sliders, and the table display.
- **Tabs Management**: Allows users to save, view, and delete multiple tables as tabs. Each tab contains a distinct table and can be removed individually or in bulk.
- **Checkbox for Tab Deletion**: Users can select and delete multiple tabs through a checkbox-based interface.
- **Sliders for Inputs**: Integrated jQuery UI sliders allow dynamic adjustment of input values with real-time validation.
- **Keyboard Interaction**: Pressing Enter in input fields triggers table generation.
- **Responsive Table Updates**: Automatically updates the table when slider values are adjusted, maintaining the 100-row/column difference limit.

This code is designed for interactive use in a GUI and includes event listeners for buttons, input fields, sliders, and tabs.

Author: Alireza Jahanban, UMass Lowell Computer Science  
Email: Alireza_Jahanban@student.uml.edu  
Copyright (c) 2024 by Alireza Jahanban. All rights reserved.  
This code is free to use by anyone for business or educational purposes with credit to the author.  
Last updated: November 2024.
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
        }

        await setup();

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
//                          calculateScore
// ---------------------------------------------------------------------------
// async function calculateScore(word) {
//     try {
//       const response = await fetch('./graphics_data/pieces.json');
//       const jsonData = await response.json();
  
//       let score = 0;
  
//       for (let i = 0; i < word.length; i++) {
//         const letter = word[i].toUpperCase();
  
//         const tile = jsonData.pieces.find(piece => piece.letter === letter);
  
//         if (tile) {
//           score += tile.value;
//         } else {
//         //   console.log(`Letter ${letter} not found in the tile set.`);
//         }
//       }
  
//     //   console.log(`The score of the word "${word}" is: ${score}`);
//     } catch (error) {
//       console.error('Error loading or parsing the JSON data:', error);
//     }
// }

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

// ---------------------------------------------------------------------------
//                          TODO
// ---------------------------------------------------------------------------
/*

after playing a word, only the number of letter tiles needed to bring the player’s “hand” back
to 7 tiles are selected


Except for the first letter, all sub-subsequent letters must be placed directly next to or below
another letter with no space. Else, they will bounce back to the “rack”.

if the word doesn't pass dict, it cannot be submitted

remaining tiles (do it the easy way) (total = 95, after each submission, deduct)
highest score
add up all the score
reset button
next word button

double check rubric

remove comments
update header comments
push to github
*/