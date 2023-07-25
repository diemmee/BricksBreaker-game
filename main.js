if (typeof document !== "undefined") {
    const canvas = document.getElementById("breaking-blocks");
    const context = canvas.getContext("2d");

    //create variables
    var LIVES = 3;
    var GAME_OVER = false;
    var SCORE = 0;
    var LEVEL = 1;
    var MAX_LEVEL = 1;
    const SCORE_BRICKISBROKEN = 1;

    /* PADDEL OBJECT */
    const paddle_width = 100;
    const paddle_height = 15;
    const paddle = {
        x: canvas.width / 2 - paddle_width / 2,
        y: canvas.height - 20,
        width: paddle_width,
        height: paddle_height,
        dx: 10,
        leftArrow: false,
        rightArrow: false,
    };

    //draw paddle
    function drawPaddle() {
        context.beginPath();
        context.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        context.fillStyle = "#0075a3";
        context.fill();
        context.closePath();
    }

    //move paddle
    function movePaddle() {
        if (paddle.leftArrow && paddle.x > 0) {
            paddle.x -= paddle.dx;
        } else if (
            paddle.rightArrow &&
            paddle.x + paddle.width < canvas.width
        ) {
            paddle.x += paddle.dx;
        }
    }

    document.addEventListener("keydown", function (event) {
        if (event.key == "ArrowLeft") {
            paddle.leftArrow = true;
        } else if (event.key == "ArrowRight") {
            paddle.rightArrow = true;
        }
    });
    document.addEventListener("keyup", function (event) {
        if (event.key == "ArrowLeft") {
            paddle.leftArrow = false;
        } else if (event.key == "ArrowRight") {
            paddle.rightArrow = false;
        }
    });

    /* BALL OBJECT */
    const ball_radius = 10;
    const ball = {
        x: canvas.width / 2,
        y: paddle.y - ball_radius,
        radius: ball_radius,
        dx: 4,
        dy: -4,
        speed: 5,
    };

    //draw ball
    function drawBall() {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    //move ball
    function moveBall() {
        SOUND_EFFECT.play();
        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = paddle.y - ball_radius;
        ball.dx = 4 * (Math.random() * 2 - 1);
        ball.dy = -4;
    }

    //wall ball collision
    function wallBallCollision() {
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
            WALL_COLLIDE.play();
        } else if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
            // WALL_COLLIDE.play();
        } else if (ball.y + ball.radius > canvas.height) {
            LIVES--;
            LIFE_LOST.play();
            resetBall();
        }
    }

    //paddle ball collision
    function paddleBallCollision() {
        if (
            ball.y > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width &&
            ball.y < paddle.y + paddle.height
        ) {
            PADDLE_HIT.play();
            ball.dy = -ball.dy;
        }
    }

    //bong va gach va cham
    function brickBallCollision() {
        for (var r = 0; r < brick.row; r++) {
            for (var c = 0; c < brick.column; c++) {
                var b = bricks[r][c];
                if (!b.isBroken) {
                    if (
                        ball.x + ball.radius > b.x &&
                        ball.x - ball.radius < b.x + brick.width &&
                        ball.y + ball.radius > b.y &&
                        ball.y - ball.radius < b.y + brick.height
                    ) {
                        BRICK_COLLIDE.play();
                        ball.dy = -ball.dy;
                        b.isBroken = true;
                        SCORE += SCORE_BRICKISBROKEN;
                    }
                }
            }
        }
    }

    /* BRICKS OBJECT */
    const brick = {
        width: 80,
        height: 20,
        offSetLeft: 20,
        offSetRight: 40,
        offSetTop: 10,
        marginTop: 50,
        row: 3,
        column: 7,
    };
    var bricks = [];

    //const brick
    function createBrick() {
        for (var r = 0; r < brick.row; r++) {
            bricks[r] = [];
            for (var c = 0; c < brick.column; c++) {
                bricks[r][c] = {
                    x:
                        brick.offSetRight +
                        c * (brick.offSetLeft + brick.width) +
                        brick.offSetLeft,
                    y:
                        r * (brick.offSetTop + brick.height) +
                        brick.offSetTop +
                        brick.marginTop,
                    isBroken: false,
                };
            }
        }
    }
    createBrick();

    //draw bricks
    function drawBricks() {
        for (var r = 0; r < brick.row; r++) {
            for (var c = 0; c < brick.column; c++) {
                var b = bricks[r][c];
                if (!b.isBroken) {
                    context.beginPath();
                    context.rect(b.x, b.y, brick.width, brick.height);
                    context.fillStyle = "#0075a3";
                    context.fill();
                    context.closePath();
                }
            }
        }
    }

    //graphic
    function levelUp() {
        var isLevelDone = true;
        for (var r = 0; r < brick.row; r++) {
            for (var c = 0; c < brick.column; c++) {
                isLevelDone = isLevelDone && bricks[r][c].isBroken;
            }
        }
        if (isLevelDone) {
            LEVEL_UP.play();
            if (LEVEL >= MAX_LEVEL) {
                showYouWin();
                gameOver = true;
                return;
            }
            brick.row++;
            createBrick();
            ball.speed += 0.5;
            resetBall();
            LEVEL++;
        }
    }

    const LIFE_IMG = new Image();
    LIFE_IMG.src = "img/tada.png";

    const SCORE_IMG = new Image();
    SCORE_IMG.src = "img/score1.png";

    const LEVEL_IMG = new Image();
    LEVEL_IMG.src = "img/level.png";

    const SOUND_EFFECT = new Audio();
    SOUND_EFFECT.src = "sound/sound.mp3";

    const LEVEL_UP = new Audio();
    LEVEL_UP.src = "sound/level-complete.mp3";

    const FAIL = new Audio();
    FAIL.src = "sound/fail.mp3";

    const LIFE_LOST = new Audio();
    LIFE_LOST.src = "sound/life-lost.mp3";

    const WALL_COLLIDE = new Audio();
    WALL_COLLIDE.src = "sound/wall-hit.mp3";

    const BRICK_COLLIDE = new Audio();
    BRICK_COLLIDE.src = "sound/brick.mp3";

    const PADDLE_HIT = new Audio();
    PADDLE_HIT.src = "sound/paddle.mp3";

    const soundElement = document.getElementById("sound");
    soundElement.addEventListener("click", audioManager);

    function audioManager() {
        var imgSrc = soundElement.getAttribute("src");
        var SOUND_IMG =
            imgSrc == "img/sound-off.png"
                ? "img/sound-on.png"
                : "img/sound-off.png";
        soundElement.setAttribute("src", SOUND_IMG);

        WALL_COLLIDE.muted = WALL_COLLIDE.muted ? false : true;
        PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
        BRICK_COLLIDE.muted = BRICK_COLLIDE.muted ? false : true;
        LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
        FAIL.muted = FAIL.muted ? false : true;
        LEVEL_UP.muted = LEVEL_UP.muted ? false : true;
        SOUND_EFFECT.muted = SOUND_EFFECT.muted ? false : true;
    }

    const gameover = document.getElementById("gameover");
    const restart = document.getElementById("restart");
    const youwon = document.getElementById("won");

    const youlose = document.getElementById("fail");
    restart.addEventListener("click", function () {
        location.reload();
    });

    function showYouWin() {
        gameover.style.display = "block";
        youwon.style.display = "block";
    }

    function showYouLose() {
        gameover.style.display = "block";
        youlose.style.display = "block";
    }

    function showGameStart(text, textX, textY, img, imgX, imgY) {
        context.fillStyle = "#FFF";
        context.font = "26px anton";
        context.fillText(text, textX, textY);
        context.drawImage(img, imgX, imgY, (width = 30), (height = 30));
    }

    function gameOver() {
        if (LIVES <= 0) {
            FAIL.play();
            showYouLose();
            GAME_OVER = true;
        }
    }
    function draw() {
        //live
        showGameStart(LIVES, 735, 45, LIFE_IMG, 700, 20);
        //score
        showGameStart(SCORE, 80, 45, SCORE_IMG, 45, 20);
        //level
        showGameStart(LEVEL, 435, 45, LEVEL_IMG, 400, 20);

        drawBall();
        drawPaddle();
        drawBricks();
        gameOver();
    }

    function update() {
        moveBall();
        movePaddle();
        wallBallCollision();
        paddleBallCollision();
        brickBallCollision();
        levelUp();
    }
    function loop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        draw();
        update();

        if (!GAME_OVER) {
            requestAnimationFrame(loop);
        }
    }
    loop();
}
