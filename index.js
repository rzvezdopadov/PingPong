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
// Size let
    sizeLet: 20,
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
    stages: [],
    render: () => {
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
    }
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
    state.render();
}
 ,1000/state.renderFrame);

let btnStartOnClick = () => {
    if (state.statusGame === typeGameStop) {
        state.statusGame = typeGamePlay;
        setValue("btnStart","Pause");
    } else if (state.statusGame === typeGamePlay) {
        state.statusGame = typeGamePause;
        setValue("btnStart","Start");
    } else if (state.statusGame === typeGamePause) {
        state.statusGame = typeGamePlay;
        setValue("btnStart","Pause");
    } 
}

let btnStop = () => {
    state.statusGame = typeGameStop;
    state.currentStage = [];
}

let setLevel = (a) => {setInner("levelGame","Level: "+a);}

let getElem = (a) => {return document.getElementById(a);}
let setInner = (a,b) => {return document.getElementById(a).innerHTML = b;}
let setValue = (a,b) => {getElem(a).value = b;}







