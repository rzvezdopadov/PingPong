// Phase game
const typeGameStop  = 0;
const typeGamePlay  = 1;
const typeGamePause = 2;
const typeGameWin   = 3;
const typeGameFail  = 4;
// Route ball
const routeBallTopRight = 0;
const routeBallTopLeft = 1;
const routeBallBottomRight = 2;
const routeBallBottomLeft = 3;
// Other const
const finalRad = (360 * Math.PI) / 180;
// State game
let state = {
    statusGame: typeGameStop,
// General settings
    renderFrame: 50,
    clientMinX: 0,
	clientMinY: 0,
	clientMaxX: 600,
    clientMaxY: 800,
    baseSpeedBall: 200,
    coefficientSpeed: 20,
    totalPoint: 0,
    maxStage: 50,
// barrier
    sizeBarrier: 40,
    healthbarrierOnLevel: 5,
    amountBarrierOnLevel: 5,
// Parameters rocket
    racketPos: 350,
    racketLong: 100,
    racketLongBonusTime: 0,
    racketDepth: 5,
// Parameters ball
    ballSize: 20,
    ballSizeBonusTime: 0,
    ballPosX: 0,
    ballPosY: 0,
    ballSpeedX: 0,
    ballSpeedY: 0,
    ballRoute: routeBallTopRight,
// Levels
    stage: 1,
    currentStage: [],
}

window.onload = () => {
    let canvas = getElem("App");
    canvas.width = state.clientMaxX;
    canvas.height = state.clientMaxY;
    createNewStage();

    canvas.onmousemove = (e) => {
        let pos = e.offsetX+state.racketLong/2;
        if (pos > state.clientMaxX) {
            pos = state.clientMaxX;
        } else if (pos < state.racketLong) {
            pos = state.racketLong;
        } 
        state.racketPos = pos;

        if (state.statusGame === typeGameStop || state.statusGame === typeGameFail || state.statusGame === typeGameWin) {
            state.ballPosY = state.clientMaxY - state.ballSize;
            state.ballPosX = pos - state.racketLong/2;
        } 
    }    

    canvas.onclick = () => {
        btnStartOnClick(); 
    }

    getElem("btnStart").onclick = () => {
        btnStartOnClick();
    }

    getElem("btnStop").onclick = () => {
        btnStop();
        setValue("btnStart","Start");
        createNewStage();
    }

    getElem("btnPreviousStage").onclick = () => {
        btnStop();
        if (--state.stage < 1) {state.stage = state.maxStage;}
        setLevel(state.stage);
        createNewStage();
    }

    getElem("btnNextStage").onclick = () => {
        btnStop();
        if (++state.stage > state.maxStage) {state.stage = 1};
        setLevel(state.stage);
        createNewStage();
    }
}

setInterval(() => {
    render();
}
 ,1000/state.renderFrame);

let btnStartOnClick = () => {

    if (state.statusGame === typeGameFail || state.statusGame === typeGameWin) {
        if (state.statusGame === typeGameWin) {
            state.stage++;
        }
        state.statusGame = typeGameStop;
        createNewStage();
    } else if (state.statusGame === typeGameStop ) {
        state.statusGame = typeGamePlay;
        setValue("btnStart","Pause");
        btnNewGame();
    } else if (state.statusGame === typeGamePlay) {
        state.statusGame = typeGamePause;
        setValue("btnStart","Start");
    } else if (state.statusGame === typeGamePause) {
        state.statusGame = typeGamePlay;
        setValue("btnStart","Pause");
    } 
}

let render = () => {
    let canvas = getElem("App");
    let ctx = canvas.getContext("2d");

    let drawFigures = () => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#FFF";
        ctx.fillRect(state.racketPos-state.racketLong, state.clientMaxY - state.racketDepth - 3, state.racketLong, state.racketDepth);

        for (let i=0;i<state.currentStage.length;i++) {
            ctx.strokeStyle = "#6eeb48";
            ctx.strokeRect(state.currentStage[i].barrierPosX*state.sizeBarrier+2, state.currentStage[i].barrierPosY*state.sizeBarrier+2, state.sizeBarrier-4, state.sizeBarrier-4);

            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.font="15px Arial";
            ctx.fillText(state.currentStage[i].barrierHealth,state.currentStage[i].barrierPosX*state.sizeBarrier+state.sizeBarrier/2,state.currentStage[i].barrierPosY*state.sizeBarrier+state.sizeBarrier/2);
        }

        ctx.beginPath();
        ctx.fillStyle = "#5aecf1";
        ctx.arc(state.ballPosX, state.ballPosY,state.ballSize/2,0,finalRad,true);
        ctx.fill();

        let setAttrPhrase = () => {
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.font="50px Arial";
        }

        if (state.statusGame === typeGameWin) {
            setAttrPhrase();
            ctx.fillText("You Win!",state.clientMaxX/2,(state.clientMaxY*3)/4);
        }

        if (state.statusGame === typeGameFail) {
            setAttrPhrase();
            ctx.fillText("You Fail!",state.clientMaxX/2,(state.clientMaxY*3)/4);
        }

    }

    drawFigures();

    if (state.statusGame === typeGamePlay && state.currentStage.length === 0) {
        state.statusGame = typeGameWin;
    }

    if (state.statusGame === typeGamePlay) {

        moveBall();
    //    drawFigures();
        collisionWall();
        collisionBarrier();
    }
}

let btnNewGame = () => {
    if (state.racketPos > state.clientMaxX/2) {
        state.ballRoute = routeBallTopLeft;
    } else {
        state.ballRoute = routeBallTopRight;
    }
    
    state.totalPoint = 0;

    state.ballSpeedX = state.baseSpeedBall + state.stage * state.coefficientSpeed;
    state.ballSpeedY = state.baseSpeedBall + state.stage * state.coefficientSpeed;
    setInner("speedGame","Speed: "+state.ballSpeedX);
    setInner("levelGame","Level: "+state.stage);
    setInner("pointGame","Point: "+state.totalPoint);
}

let btnStop = () => {
    state.statusGame = typeGameStop;
    state.ballSpeedX = 0;
    state.ballSpeedY = 0;
    setInner("speedGame","Speed: "+state.ballSpeedX);
}

let moveBall = () => {
    let speedX = nDouble(state.ballSpeedX/state.renderFrame,3);
    let speedY = nDouble(state.ballSpeedY/state.renderFrame,3);

    if (state.ballRoute === routeBallTopLeft) {
        state.ballPosX -= speedX;  
        state.ballPosY -= speedY;
    } else if (state.ballRoute === routeBallTopRight) {
        state.ballPosX += speedX;  
        state.ballPosY -= speedY;
    } else if (state.ballRoute === routeBallBottomLeft) {
        state.ballPosX -= speedX;  
        state.ballPosY += speedY;
    } else if (state.ballRoute === routeBallBottomRight) {
        state.ballPosX += speedX;  
        state.ballPosY += speedY;
    }
}

let collisionWall = () => {
    let radiusBall = state.ballSize/2;
    if (state.ballPosX >= state.clientMaxX-radiusBall) {
        if (state.ballRoute === routeBallTopRight) {
            state.ballRoute = routeBallTopLeft;
            state.ballPosY += Math.abs(state.ballPosX - (state.clientMaxX-radiusBall));
        } else {
            state.ballRoute = routeBallBottomLeft;
            state.ballPosY -= Math.abs(state.ballPosX - (state.clientMaxX-radiusBall));
        }

        state.ballPosX -= Math.abs(state.ballPosX - (state.clientMaxX-radiusBall));
    } else if (state.ballPosX <= radiusBall) {
        if (state.ballRoute === routeBallTopLeft) {
            state.ballRoute = routeBallTopRight;
            state.ballPosY += Math.abs(state.ballPosX-radiusBall);
        } else {
            state.ballRoute = routeBallBottomRight;
            state.ballPosY -= Math.abs(state.ballPosX-radiusBall);
        }
        state.ballPosX += Math.abs(state.ballPosX-radiusBall);
    } else if (state.ballPosY >= state.clientMaxY-radiusBall-state.racketDepth-3) {
        if (state.ballPosX < state.racketPos-state.racketLong || state.ballPosX > state.racketPos) {
            state.statusGame = typeGameFail;
        }
        if (state.ballRoute === routeBallBottomLeft) {
            state.ballRoute = routeBallTopLeft;
            state.ballPosX += Math.abs(state.ballPosY - (state.clientMaxY-radiusBall));
        } else {
            state.ballRoute = routeBallTopRight;
            state.ballPosX -= Math.abs(state.ballPosY - (state.clientMaxY-radiusBall));
        }
        state.ballPosY -= Math.abs(state.ballPosY - (state.clientMaxY-radiusBall));
    } else if (state.ballPosY <= radiusBall) {
        if (state.ballRoute === routeBallTopLeft) {
            state.ballRoute = routeBallBottomLeft;
            state.ballPosX += Math.abs(state.ballPosY-radiusBall);
        } else {
            state.ballRoute = routeBallBottomRight;
            state.ballPosX -= Math.abs(state.ballPosY-radiusBall);
        }
        state.ballPosY += Math.abs(state.ballPosY-radiusBall);
    }
}

const collisionTypeSide  = 0;
const collisionTypeAngle = 1;

let collisionBarrier = () => {
    for (let i=0; i<state.currentStage.length;i++) {
        let collision = false;
        let collisionType = false;
        let barrierSideLeftX = state.currentStage[i].barrierPosX*state.sizeBarrier;
        let barrierSideTopY = state.currentStage[i].barrierPosY*state.sizeBarrier;
        let barrierSideRightX = barrierSideLeftX+state.sizeBarrier;
        let barrierSideBottomY = barrierSideTopY+state.sizeBarrier;
        let radiusBall = state.ballSize/2;

        if (barrierSideLeftX - radiusBall < state.ballPosX && state.ballPosX < barrierSideRightX + radiusBall) {
            if (barrierSideTopY - radiusBall < state.ballPosY && state.ballPosY < barrierSideBottomY+radiusBall) {
                collision = true;
                collisionType = collisionTypeSide;
            }
        }

        if(collision) {
            state.totalPoint++;
            setInner("pointGame","Point: "+state.totalPoint);
            if (--state.currentStage[i].barrierHealth < 1) {
                state.currentStage.splice(i,1);  
                break;
            }
            if (collisionType === collisionTypeSide) {
                if ((Math.abs((barrierSideLeftX - radiusBall) - state.ballPosX) <= radiusBall || Math.abs(barrierSideLeftX - state.ballPosX) <= radiusBall) && 
                    (state.ballRoute === routeBallTopRight || state.ballRoute === routeBallBottomRight)) {
                        if (state.ballRoute === routeBallTopRight) {
                            state.ballRoute = routeBallTopLeft;
                            state.ballPosY += Math.abs((barrierSideLeftX - radiusBall) - state.ballPosX);
                        } else {
                            state.ballRoute = routeBallBottomLeft;
                            state.ballPosY -= Math.abs((barrierSideLeftX - radiusBall) - state.ballPosX);
                        }
                        state.ballPosX -= Math.abs((barrierSideLeftX - radiusBall) - state.ballPosX);
                } else if ((Math.abs((barrierSideRightX + radiusBall) - state.ballPosX) <= radiusBall || Math.abs(barrierSideRightX  - state.ballPosX) <= radiusBall) && 
                    (state.ballRoute === routeBallTopLeft || state.ballRoute === routeBallBottomLeft)) {
                        if (state.ballRoute === routeBallTopLeft) {
                            state.ballRoute = routeBallTopRight;
                            state.ballPosY += Math.abs((barrierSideRightX + radiusBall) - state.ballPosX);
                        } else {
                            state.ballRoute = routeBallBottomRight;
                            state.ballPosY -= Math.abs((barrierSideRightX + radiusBall) - state.ballPosX);
                        }
                        state.ballPosX += Math.abs((barrierSideRightX + radiusBall) - state.ballPosX);
                } else if ((Math.abs((barrierSideTopY - radiusBall) - state.ballPosY) <= radiusBall || Math.abs(barrierSideTopY - state.ballPosY) <= radiusBall) && 
                    (state.ballRoute === routeBallBottomLeft || state.ballRoute === routeBallBottomRight)) {
                        if (state.ballRoute === routeBallBottomLeft) {
                            state.ballRoute = routeBallTopLeft;
                            state.ballPosX += Math.abs((barrierSideTopY - radiusBall) - state.ballPosY);
                        } else {
                            state.ballRoute = routeBallTopRight;
                            state.ballPosX -= Math.abs((barrierSideTopY - radiusBall) - state.ballPosY);
                        }
                        state.ballPosY -= Math.abs((barrierSideTopY - radiusBall) - state.ballPosY);
                } else if ((Math.abs((barrierSideBottomY + radiusBall) - state.ballPosY) <= radiusBall || Math.abs(barrierSideBottomY - state.ballPosY) <= radiusBall) && 
                    (state.ballRoute === routeBallTopLeft || state.ballRoute === routeBallTopRight)) {
                        if (state.ballRoute === routeBallTopLeft) {
                            state.ballRoute = routeBallBottomLeft;
                            state.ballPosX += Math.abs((barrierSideBottomY + radiusBall) - state.ballPosY);
                        } else {
                            state.ballRoute = routeBallBottomRight;
                            state.ballPosX -= Math.abs((barrierSideBottomY + radiusBall) - state.ballPosY);
                        }
                        state.ballPosY += Math.abs((barrierSideBottomY + radiusBall) - state.ballPosY);
                }
            }
        }
    }
}

let createNewStage = () => {
    state.currentStage = [];
    for (let i=0;i<state.stage*state.amountBarrierOnLevel;i++) {
        createNewBarrierBox();  
    }
}

let createNewBarrierBox = () => {
    let barrierPosX = nRand(state.clientMaxX/state.sizeBarrier);
    let barrierPosY = nRand(state.clientMaxY/(state.sizeBarrier*2));
    let barrierHealth = state.stage*state.healthbarrierOnLevel;
    let barrierCollision = false;
    for (i=0;i<state.currentStage.length;i++) {
        if (state.currentStage[i].barrierPosX === barrierPosX && state.currentStage[i].barrierPosY === barrierPosY ) {
            barrierCollision = true;
        }
    }

    if (barrierCollision == false) {
        state.currentStage[state.currentStage.length] = {
            "barrierPosX": barrierPosX,
            "barrierPosY": barrierPosY,
            "barrierHealth": barrierHealth
        }
    }
    // state.sizeBarrier
}

let nRand = (a) => {
	return Math.floor(Math.random()*a);
}

let nDouble = (a,b) => {
	if (b < 0) {b = 0;}
	let c = Math.pow(10,b);
	return Math.floor(a * c)/c;
}

let setLevel = (a) => {setInner("levelGame","Level: "+a);}

let getElem = (a) => {return document.getElementById(a);}
let setInner = (a,b) => {return document.getElementById(a).innerHTML = b;}
let setValue = (a,b) => {getElem(a).value = b;}







