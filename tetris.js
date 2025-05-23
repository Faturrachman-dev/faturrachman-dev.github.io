document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('nextPiece');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Game constants
    const BLOCK_SIZE = 30;
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const NEXT_BLOCK_SIZE = 30;
    
    // Colors for tetrominos
    const COLORS = [
        null,
        '#FF0D72', // I - Cyan
        '#0DC2FF', // J - Blue
        '#0DFF72', // L - Orange
        '#F538FF', // O - Yellow
        '#FF8E0D', // S - Green
        '#FFE138', // T - Purple
        '#3877FF'  // Z - Red
    ];
    
    // Tetromino shapes
    const SHAPES = [
        null,
        // I
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        // J
        [
            [0, 2, 0],
            [0, 2, 0],
            [2, 2, 0]
        ],
        // L
        [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ],
        // O
        [
            [4, 4],
            [4, 4]
        ],
        // S
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        // T
        [
            [0, 0, 0],
            [6, 6, 6],
            [0, 6, 0]
        ],
        // Z
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]
    ];
    
    // Game state
    let board = createBoard();
    let score = 0;
    let level = 1;
    let lines = 0;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let gameOver = false;
    let isPaused = false;
    let animationId;
    
    // Player and next piece
    let player = {
        pos: { x: 0, y: 0 },
        piece: null
    };
    let nextPiece = null;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    
    // Update score & level display
    function updateScore() {
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
    }
    
    // Create empty board
    function createBoard() {
        return Array.from(
            { length: BOARD_HEIGHT },
            () => Array(BOARD_WIDTH).fill(0)
        );
    }
    
    // Draw block
    function drawBlock(x, y, color, context = ctx, blockSize = BLOCK_SIZE) {
        context.fillStyle = color;
        context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // Border
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // Highlight
        context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x * blockSize, y * blockSize);
        context.lineTo(x * blockSize + blockSize, y * blockSize);
        context.lineTo(x * blockSize + blockSize, y * blockSize + blockSize);
        context.stroke();
    }
    
    // Draw board
    function drawBoard() {
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(x, y, COLORS[value]);
                }
            });
        });
    }
    
    // Draw tetromino
    function drawPiece(matrix, offset, context = ctx, blockSize = BLOCK_SIZE) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(
                        x + offset.x,
                        y + offset.y,
                        COLORS[value],
                        context,
                        blockSize
                    );
                }
            });
        });
    }
    
    // Draw next piece
    function drawNextPiece() {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        if (!nextPiece) return;
        
        // Center the piece in the preview
        const offset = {
            x: (nextPieceCanvas.width / NEXT_BLOCK_SIZE - nextPiece[0].length) / 2,
            y: (nextPieceCanvas.height / NEXT_BLOCK_SIZE - nextPiece.length) / 2
        };
        
        drawPiece(nextPiece, offset, nextPieceCtx, NEXT_BLOCK_SIZE);
    }
    
    // Generate random tetromino
    function getRandomPiece() {
        const pieces = 'IJLOSTZ';
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        
        // Return the corresponding shape
        return SHAPES[pieces.indexOf(randomPiece) + 1];
    }
    
    // Reset player with a new piece
    function playerReset() {
        // Use the next piece or generate a new one if it's null
        player.piece = nextPiece || getRandomPiece();
        nextPiece = getRandomPiece();
        
        // Place the player at the top-center
        player.pos.y = 0;
        player.pos.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.piece[0].length / 2);
        
        // Check for game over
        if (collide(board, player)) {
            gameOver = true;
            cancel();
            alert(`Game Over! Your score: ${score}`);
        }
        
        // Draw next piece
        drawNextPiece();
    }
    
    // Check collision
    function collide(board, player) {
        const [m, o] = [player.piece, player.pos];
        
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (board[y + o.y] &&
                    board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Merge player's tetromino to the board
    function merge(board, player) {
        player.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }
    
    // Move player
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(board, player)) {
            player.pos.x -= dir;
        }
    }
    
    // Rotate tetromino
    function rotate(matrix, dir) {
        // Transpose
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
        
        // Reverse each row to get rotation
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    // Rotate player tetromino
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.piece, dir);
        
        // Handle collision during rotation
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.piece[0].length) {
                rotate(player.piece, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }
    
    // Drop player tetromino
    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            sweepLines();
            updateScore();
        }
        dropCounter = 0;
    }
    
    // Hard drop - immediately drop to bottom
    function hardDrop() {
        while (!collide(board, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(board, player);
        playerReset();
        sweepLines();
        updateScore();
        dropCounter = 0;
    }
    
    // Clear completed lines
    function sweepLines() {
        let linesCleared = 0;
        
        outer: for (let y = BOARD_HEIGHT - 1; y >= 0; --y) {
            for (let x = 0; x < BOARD_WIDTH; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Remove completed line
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++;
            
            linesCleared++;
        }
        
        // Update score based on lines cleared
        if (linesCleared > 0) {
            // Calculate score based on level and lines (Tetris scoring system)
            const linePoints = [0, 40, 100, 300, 1200];
            score += linePoints[linesCleared] * level;
            lines += linesCleared;
            
            // Level up every 10 lines
            level = Math.floor(lines / 10) + 1;
            
            // Increase speed with level
            dropInterval = 1000 * Math.pow(0.8, level - 1);
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw board and player's tetromino
        drawBoard();
        if (player.piece) {
            drawPiece(player.piece, player.pos);
        }
        
        // Draw grid
        drawGrid();
    }
    
    // Draw grid
    function drawGrid() {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= BOARD_WIDTH; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= BOARD_HEIGHT; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(canvas.width, i * BLOCK_SIZE);
            ctx.stroke();
        }
    }
    
    // Game loop
    function update(time = 0) {
        if (gameOver || isPaused) {
            return;
        }
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        
        draw();
        animationId = requestAnimationFrame(update);
    }
    
    // Start/restart game
    function start() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // Reset game state
        board = createBoard();
        score = 0;
        lines = 0;
        level = 1;
        gameOver = false;
        isPaused = false;
        
        // Reset UI
        updateScore();
        pauseButton.textContent = 'Pause';
        
        // Initialize player and next piece
        nextPiece = getRandomPiece();
        playerReset();
        
        // Start game loop
        update();
    }
    
    // Pause/resume game
    function togglePause() {
        isPaused = !isPaused;
        
        if (isPaused) {
            cancelAnimationFrame(animationId);
            pauseButton.textContent = 'Resume';
        } else {
            lastTime = performance.now();
            update();
            pauseButton.textContent = 'Pause';
        }
    }
    
    // Cancel animation frame
    function cancel() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    // Keyboard controls
    document.addEventListener('keydown', event => {
        if (gameOver) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                playerMove(-1);
                break;
            case 'ArrowRight':
                playerMove(1);
                break;
            case 'ArrowDown':
                playerDrop();
                break;
            case 'ArrowUp':
                playerRotate(1);
                break;
            case ' ':
                hardDrop();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
        }
    });
    
    // Button controls
    startButton.addEventListener('click', start);
    pauseButton.addEventListener('click', togglePause);
    
    // Mobile support through swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', e => {
        if (gameOver || isPaused) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        const diffX = touchStartX - touchX;
        const diffY = touchStartY - touchY;
        
        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 5) {
                playerMove(-1); // Swipe right to left = move left
            } else if (diffX < -5) {
                playerMove(1); // Swipe left to right = move right
            }
            touchStartX = touchX;
        } 
        // Vertical swipe
        else {
            if (diffY > 5) {
                playerRotate(1); // Swipe down to up = rotate
            } else if (diffY < -5) {
                playerDrop(); // Swipe up to down = drop
            }
            touchStartY = touchY;
        }
        
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchend', e => {
        e.preventDefault();
    }, false);
    
    // Double tap for hard drop
    let lastTap = 0;
    canvas.addEventListener('touchend', e => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            hardDrop();
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
    
    // Resize canvas to fit screen
    function resizeCanvas() {
        const container = document.querySelector('.container');
        const maxWidth = container.clientWidth - 40; // account for padding
        
        if (window.innerWidth < 700 && canvas.width > maxWidth) {
            const scaleFactor = maxWidth / canvas.width;
            canvas.style.width = `${canvas.width * scaleFactor}px`;
            canvas.style.height = `${canvas.height * scaleFactor}px`;
        } else {
            canvas.style.width = '';
            canvas.style.height = '';
        }
    }
    
    window.addEventListener('resize', resizeCanvas);
    
    // Initial setup
    resizeCanvas();
    updateScore();
}); 