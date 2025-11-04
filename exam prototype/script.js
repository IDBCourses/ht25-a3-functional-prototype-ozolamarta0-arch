/*
 * Assignment 3: Functional Prototype
 * ----------------------------------
 * Programming 2025, Interaction Design Bachelor, Malmö University
 * 
 * This assignment is written by: Marta Ozola
 * 
 * GAME: Rhythm Pattern Matcher
 * 
 * GOAL: Match 10 rhythm patterns to win!
 * 
 * INTERACTION 1: Left keys (Q/W/E) = input "L"
 * INTERACTION 2: Right keys (I/O/P) = input "R"
 * INTERACTION 3: Spacebar = restart game
 * 
 * Match patterns like: LLL, RR, LRLR, LLRR
 * Based on musical rhythm patterns: 123, 12, 1234
 */

// ============================================
// STATE OBJECT
// ============================================
// State contains all CHANGING values in the game
// Object.freeze() makes it immutable - we can't accidentally modify it directly
// We must use updateState() to change any values
let state = Object.freeze({
    currentPattern: [],      // Array: The pattern the player needs to match (e.g., ['L', 'R', 'L'])
    userInput: [],           // Array: What the player has typed so far
    score: 0,                // Number: How many patterns matched correctly
    missed: 0,               // Number: How many patterns the player got wrong
    totalAttempts: 0,        // Number: score + missed (used to check if game is over)
    targetScore: 10,         // Number: Win condition - need 10 correct patterns
    lastInputTime: 0,        // Number: Timestamp of last key press (for potential timing features)
    inputTiming: []          // Array: Could store timing between keypresses (not currently used)
});

// ============================================
// SETTINGS OBJECT (CONSTANT)
// ============================================
// Settings contains all FIXED values that never change during gameplay
// const means we can't reassign this variable to something else
// Object.freeze() prevents modification of properties inside
const settings = Object.freeze({
    scoreEl: document.querySelector("#score"),       // DOM Element: Reference to score display div
    patternEl: document.querySelector("#pattern"),   // DOM Element: Reference to pattern display div
    leftKeys: ['q', 'w', 'e'],                      // Array: Keys that count as "L" input
    rightKeys: ['i', 'o', 'p'],                     // Array: Keys that count as "R" input
    patterns: [                                      // Array of Arrays: All possible rhythm patterns
        ['L', 'L', 'L'],           // Triple left (like 3/4 time: 1-2-3)
        ['R', 'R'],                // Double right (like 2/4 time: 1-2)
        ['L', 'R', 'L', 'R'],      // Alternating pattern
        ['L', 'L', 'R', 'R'],      // Grouped pattern
        ['R', 'R', 'R'],           // Triple right
        ['L', 'R'],                // Simple alternation
        ['R', 'L', 'R', 'L']       // Reverse alternation
    ]
});

// ============================================
// FUNCTION: updateState
// ============================================
// This function is how we modify the state object
// Since state is frozen, we create a NEW object with updated values
// The spread operator (...) copies all existing properties
// Then newState overwrites any properties we want to change
function updateState(newState) {
    // Example: updateState({ score: 5 }) will keep all other properties but change score to 5
    state = Object.freeze({ ...state, ...newState });
}

// ============================================
// FUNCTION: scale (utility)
// ============================================
// This normalizes a number between a min and max to a 0-1 range
// Example: scale(5, 0, 10) returns 0.5
// Currently included but not actively used in the game
function scale(num, min, max) {
    if (num < min) return 0;      // If below minimum, return 0
    if (num > max) return 1;      // If above maximum, return 1
    return (num - min) / (max - min);  // Otherwise calculate proportion
}

// ============================================
// FUNCTION: newPattern
// ============================================
// Generates a new random pattern for the player to match
// This is called at the start of the game and after each pattern is completed
function newPattern() {
    const { patterns } = settings;  // Destructuring: Extract patterns array from settings
    
    // DATA PROCESSING: Generate random index to pick a pattern
    // Math.random() gives 0 to 0.999...
    // Multiply by patterns.length (7) gives 0 to 6.999...
    // Math.floor() rounds down to get integer: 0, 1, 2, 3, 4, 5, or 6
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Update state with new pattern and clear user input
    updateState({ 
        currentPattern: randomPattern,  // Set the new pattern to match
        userInput: [],                  // Clear any previous input
        inputTiming: []                 // Clear timing data
    });
}

// ============================================
// FUNCTION: checkPattern
// ============================================
// This function compares what the user typed to the target pattern
// It's called every time the user presses a key
// This is DATA PROCESSING - comparing two arrays
function checkPattern() {
    // Destructuring: Extract multiple values from state at once
    const { currentPattern, userInput, score, missed, totalAttempts, targetScore } = state;
    
    // If user hasn't finished typing the pattern yet, don't check
    if (userInput.length !== currentPattern.length) return;

    // ITERATION: Use a for loop to compare each element
    // This demonstrates the required "for loop" element
    let matches = true;  // Assume it matches until we find a difference
    for (let i = 0; i < currentPattern.length; i++) {
        if (userInput[i] !== currentPattern[i]) {
            matches = false;  // Found a mismatch
            break;            // Stop checking, we know it's wrong
        }
    }

    // Update score based on whether pattern matched
    if (matches) {
        // Correct! Increment score and total attempts
        updateState({ 
            score: score + 1, 
            totalAttempts: totalAttempts + 1
        });
    } else {
        // Wrong! Increment missed and total attempts
        updateState({ 
            missed: missed + 1,
            totalAttempts: totalAttempts + 1
        });
    }

    // Check if game is over (reached target number of attempts)
    if (state.totalAttempts >= targetScore) {
        settings.patternEl.textContent = "GAME OVER!";
    } else {
        newPattern();  // Generate next pattern to play
    }
}

// ============================================
// FUNCTION: update (game loop)
// ============================================
// This is the main game loop function
// requestAnimationFrame calls this function ~60 times per second
// Currently just calls itself recursively - could add game logic here
function update() {
    requestAnimationFrame(update);  // Schedule next frame
}

// ============================================
// FUNCTION: use (visual output loop)
// ============================================
// This function updates what the player sees on screen
// It runs ~60 times per second via requestAnimationFrame
// This separates VISUAL updates from GAME LOGIC
function use() {
    // Destructuring: Get values we need from state and settings
    const { score, missed, currentPattern, userInput, targetScore, totalAttempts } = state;
    const { scoreEl, patternEl } = settings;
    
    // Build the pattern display showing progress
    // This is DATA PROCESSING and DOM MANIPULATION
    let displayText = '';  // String to build HTML
    
    // ITERATION: Loop through each letter in the pattern
    for (let i = 0; i < currentPattern.length; i++) {
        if (i < userInput.length) {
            // Player has typed this letter - show it in black
            displayText += `<span style="color: black;">${userInput[i]}</span> `;
        } else {
            // Player hasn't typed this yet - show it in gray
            displayText += `<span style="color: lightgray;">${currentPattern[i]}</span> `;
        }
    }
    
    // DOM MANIPULATION: Update the pattern element with HTML
    patternEl.innerHTML = displayText;

    // Update scoreboard display
    // DOM MANIPULATION: Change text content and style
    if (totalAttempts < targetScore) {
        // Game still in progress - show black text
        scoreEl.textContent = `Score: ${score}/${targetScore}, Missed: ${missed}`;
        scoreEl.style.color = 'black';
    } else {
        // Game over - show red text
        scoreEl.textContent = `Score: ${score}/${targetScore}, Missed: ${missed}`;
        scoreEl.style.color = 'red';
    }

    // Schedule next visual update
    requestAnimationFrame(use);
}

// ============================================
// FUNCTION: setup
// ============================================
// This is called once when the page loads
// Sets up event listeners and starts the game
function setup() {
    // Destructuring: Get key arrays from settings
    const { leftKeys, rightKeys } = settings;
    
    // EVENT HANDLER: Listen for keyboard input
    // This is the required "event handler" element
    document.addEventListener("keydown", function(event) {
        const key = event.key.toLowerCase();  // Convert to lowercase for comparison
        
        // INTERACTION TYPE 3: SPACEBAR RESTART
        // This provides a third type of keyboard interaction
        if (event.code === 'Space') {
            // Reset all state values to start fresh
            updateState({
                currentPattern: [],
                userInput: [],
                score: 0,
                missed: 0,
                totalAttempts: 0,
                lastInputTime: 0,
                inputTiming: []
            });
            newPattern();  // Generate first pattern
            return;        // Exit function early
        }
        
        // Don't accept input if game is over
        if (state.totalAttempts >= state.targetScore) return;

        // DATA PROCESSING: Determine if key press is valid and which type
        let inputType = null;  // Will be 'L', 'R', or stay null
        
        // INTERACTION TYPE 1: LEFT KEYS (Q/W/E)
        // .includes() checks if the key is in the leftKeys array
        if (leftKeys.includes(key)) inputType = 'L';
        
        // INTERACTION TYPE 2: RIGHT KEYS (I/O/P)
        else if (rightKeys.includes(key)) inputType = 'R';
        
        // If key wasn't left or right, ignore it
        else return;

        // DATA PROCESSING: Add the input to our array
        // Spread operator creates new array with old values plus new one
        const newInput = [...state.userInput, inputType];
        
        // Update state with new input and timestamp
        updateState({
            userInput: newInput,
            lastInputTime: performance.now()  // Get current time in milliseconds
        });

        // Check if pattern is complete and correct
        checkPattern();
    });
    
    // Start the game
    newPattern();  // Generate first pattern to match
    update();      // Start game logic loop
    use();         // Start visual update loop
}

// ============================================
// START THE GAME
// ============================================
// Call setup when page loads - this starts everything
setup();