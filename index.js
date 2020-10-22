// Phase game
const typeGameStop  = 0;
const typeGamePlay  = 1;
const typeGamePause = 2;
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
    coefficientSpeed: 100,
// Size barrier
    sizeBarrier: 20,
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
    canvas.onmousemove = (e) => {
        let pos = e.offsetX+state.racketLong/2;
        if (pos > state.clientMaxX) {
            pos = state.clientMaxX;
        } else if (pos < state.racketLong) {
            pos = state.racketLong;
        } 
        state.racketPos = pos;

        if (state.statusGame === typeGameStop) {
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
    }

    getElem("btnPreviousStage").onclick = () => {
        btnStop();
        if (--state.stage < 1) {state.stage = 10;}
        setLevel(state.stage);
    }

    getElem("btnNextStage").onclick = () => {
        btnStop();
        state.stage++;
        setLevel(state.stage);
    }
}

setInterval(() => {
    render();
}
 ,1000/state.renderFrame);

let btnStartOnClick = () => {
    if (state.statusGame === typeGameStop) {
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

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFF";
    ctx.fillRect(state.racketPos-state.racketLong, state.clientMaxY - state.racketDepth - 3, state.racketLong, state.racketDepth);

    ctx.beginPath();
    ctx.fillStyle = "#5aecf1";
    ctx.arc(state.ballPosX, state.ballPosY,state.ballSize/2,0,finalRad,true);
    ctx.fill();

    if (state.statusGame === typeGamePlay) {
        moveBall();
        collisionWall();
    }
}

let btnNewGame = () => {
    if (state.racketPos > state.clientMaxX/2) {
        state.ballRoute = routeBallTopLeft;
    } else {
        state.ballRoute = routeBallTopRight;
    }
    
    state.ballSpeedX = state.stage * state.coefficientSpeed;
    state.ballSpeedY = state.stage * state.coefficientSpeed;
    setInner("speedGame","Speed: "+state.ballSpeedX);
    setInner("levelGame","Level: "+state.stage);
    for (let i=0;i<state.stage*state.amountBarrierOnLevel;i++) {
        createNewBarrierBox();
    }
}

let btnStop = () => {
    state.statusGame = typeGameStop;
    state.currentStage = [];
    state.ballSpeedX = 0;
    state.ballSpeedY = 0;
    setInner("speedGame","Speed: "+state.ballSpeedX);
}

let moveBall = () => {
    let speedX = nDouble(state.ballSpeedX/state.renderFrame,3);
    let speedY = nDouble(state.ballSpeedY/state.renderFrame,3);

    if (state.ballRoute === routeBallTopLeft) {
        state.ballPosX -= nDouble(state.ballSpeedX/state.renderFrame,3);  
        state.ballPosY -= nDouble(state.ballSpeedY/state.renderFrame,3);
    } else if (state.ballRoute === routeBallTopRight) {
        state.ballPosX += nDouble(state.ballSpeedX/state.renderFrame,3);  
        state.ballPosY -= nDouble(state.ballSpeedY/state.renderFrame,3);
    } else if (state.ballRoute === routeBallBottomLeft) {
        state.ballPosX -= nDouble(state.ballSpeedX/state.renderFrame,3);  
        state.ballPosY += nDouble(state.ballSpeedY/state.renderFrame,3);
    } else if (state.ballRoute === routeBallBottomRight) {
        state.ballPosX += nDouble(state.ballSpeedX/state.renderFrame,3);  
        state.ballPosY += nDouble(state.ballSpeedY/state.renderFrame,3);
    }
}

let collisionWall = () => {
    if (state.ballPosX > state.clientMaxX-state.ballSize/2) {
        if (state.ballRoute === routeBallTopRight) {
            state.ballRoute = routeBallTopLeft;
        } else {
            state.ballRoute = routeBallBottomLeft;
        }
    } else if (state.ballPosX < state.ballSize/2) {
        if (state.ballRoute === routeBallTopLeft) {
            state.ballRoute = routeBallTopRight;
        } else {
            state.ballRoute = routeBallBottomRight;
        }
    } else if (state.ballPosY > state.clientMaxY-state.ballSize/2) {
        if (state.ballRoute === routeBallBottomLeft) {
            state.ballRoute = routeBallTopLeft;
        } else {
            state.ballRoute = routeBallTopRight;
        }
    } else if (state.ballPosY < state.ballSize/2) {
        if (state.ballRoute === routeBallTopLeft) {
            state.ballRoute = routeBallBottomLeft;
        } else {
            state.ballRoute = routeBallBottomRight;
        }
    }
}

let createNewBarrierBox = () => {
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







