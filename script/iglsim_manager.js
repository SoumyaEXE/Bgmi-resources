let alphaData = [];
let defaultPhase = 0;
let gameObj = null;

function initIglSimManager(imagePath) {
    let canvas = document.getElementById("mask-canvas");
    let context = document.getElementById("mask-canvas").getContext("2d");
    let imageObj = new Image();
    imageObj.onload = function() {
        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        context.drawImage(imageObj, 0, 0, 2000, 2000, 0, 0, 2000, 2000);
        let rawData = context.getImageData(0,0,2000,2000).data;
        for( let i = 0; i < rawData.length; i++ ) {
            if((i+1) % 4 == 0) {
                alphaData.push(rawData[i]);
            }
        }
        
        gameObj = createGame();
        showPhase(gameObj, defaultPhase);
        setupPhaseChangers(gameObj);
    };
    imageObj.src = imagePath;
}

function setupPhaseChangers(gameObj) {
    document.getElementById("phase-0").addEventListener("click", function() {
        showPhase(gameObj, 0);
    });
    document.getElementById("phase-1").addEventListener("click", function() {
        showPhase(gameObj, 1);
    });
    document.getElementById("phase-2").addEventListener("click", function() {
        showPhase(gameObj, 2);
    });
    document.getElementById("phase-3").addEventListener("click", function() {
        showPhase(gameObj, 3);
    });
    document.getElementById("phase-4").addEventListener("click", function() {
        showPhase(gameObj, 4);
    });
    document.getElementById("phase-5").addEventListener("click", function() {
        showPhase(gameObj, 5);
    });
    document.getElementById("phase-6").addEventListener("click", function() {
        showPhase(gameObj, 6);
    });
    document.getElementById("phase-7").addEventListener("click", function() {
        showPhase(gameObj, 7);
    });
    document.getElementById("phase-8").addEventListener("click", function() {
        showPhase(gameObj, 8);
    });
    document.getElementById("new-game").addEventListener("click", function() {
        showPhase(gameObj, -1);
        gameObj = createGame();
        showPhase(gameObj, defaultPhase);
    });
}

function getC1AnalysisParams(phase1) {
    let out = {
        x: Math.round(816000 * phase1.center[0] / 2000),
        y: Math.round(816000 * phase1.center[1] / 2000),
        limit: 7000,
        radius: 350
    }
    return JSON.stringify(out);
}

function getC2AnalysisParams(phase1) {
    let out = {
        x: Math.round(816000 * phase1.center[0] / 2000),
        y: Math.round(816000 * phase1.center[1] / 2000),
        limit: 7000,
        radius: 350
    }
    return JSON.stringify(out);
}

function createGame() {
    planeRouteObj = generatePlaneRoute();
    phasesObj = createZones(planeRouteObj);
    return {
        planeRouteObj,
        phasesObj
    };
}

function createZones(planeRouteObj) {
    phase1Obj = generatePhaseOne(planeRouteObj);
    document.getElementById("status-string").innerText = getC1AnalysisParams(phase1Obj);
    showPhaseCircle(phase1Obj, false);

    phase2Obj = generateArbitraryPhase(phase1Obj, 0.55, false);
    document.getElementById("status-string2").innerText = getC2AnalysisParams(phase2Obj);
    showPhaseCircle(phase2Obj, false);

    phase3Obj = generateArbitraryPhase(phase2Obj, 0.60, false);
    showPhaseCircle(phase3Obj, false);

    phase4Obj = generateArbitraryPhase(phase3Obj, 0.60, true);
    showPhaseCircle(phase4Obj, false);

    phase5Obj = generateArbitraryPhase(phase4Obj, 0.65, false);
    showPhaseCircle(phase5Obj, false);

    phase6Obj = generateArbitraryPhase(phase5Obj, 0.65, false);
    showPhaseCircle(phase6Obj, false);

    phase7Obj = generateArbitraryPhase(phase6Obj, 0.65, false);
    showPhaseCircle(phase7Obj, false);

    phase8Obj = generateArbitraryPhase(phase7Obj, 0.70, true);
    showPhaseCircle(phase8Obj, false);

    return {
        phase1Obj,
        phase2Obj,
        phase3Obj,
        phase4Obj,
        phase5Obj,
        phase6Obj,
        phase7Obj,
        phase8Obj,
    }
}

function showPhase(gameObj, phaseNum) {
    showPlaneRoute(gameObj.planeRouteObj, phaseNum <= 3 && phaseNum != -1);
    for(let i = 1; i <= 8; i++) {
        showNamedPhaseCircle(gameObj.phasesObj, i, i <= phaseNum);
    }
}

function getMaskPixel(x, y) {
    if(alphaData) {
        return alphaData[2000*y + x];
    }
    return -1;
}

function getNumberOfWaterPixelsInCircle(center, radius) {
    function isInCircle(x, y) {
        return Math.sqrt(Math.pow(x-center[0], 2) + Math.pow(y-center[1], 2)) <= radius;
    }

    let landRatioResolution = 5;
    let numWaters = 0;
    for(let x = 0; x < 2000; x += landRatioResolution) {
        for(let y = 0; y < 2000; y += landRatioResolution) {
            if(isInCircle(x, y)) {
                numWaters += (getMaskPixel(x, y) > 0) ? 1 : 0;
            }
        }
    }
    return numWaters;
}

function drawPlaneStartpoint(point) {
    let map = document.getElementById("map");

    let svgns = "http://www.w3.org/2000/svg";
    let circle = document.createElementNS( svgns, 'circle' );
    circle.setAttributeNS(null, 'cx', point[0]);
    circle.setAttributeNS(null, 'cy', point[1]);
    circle.setAttributeNS(null, 'r', 15);
    circle.setAttributeNS(null, 'fill', 'white' );

    map.appendChild(circle);
    return circle;
}

function drawPlaneLine(start, end) {
    let map = document.getElementById("map");

    let svgns = "http://www.w3.org/2000/svg";
    let baseLine = document.createElementNS( svgns, 'line' );
    baseLine.setAttribute('x1', start[0]);
    baseLine.setAttribute('y1', start[1]);
    baseLine.setAttribute('x2', end[0]);
    baseLine.setAttribute('y2', end[1]);
    baseLine.setAttribute("stroke", "white");
    baseLine.setAttribute("stroke-width", 8);

    let dashLine1 = document.createElementNS( svgns, 'line' );
    dashLine1.setAttribute('x1', start[0]);
    dashLine1.setAttribute('y1', start[1]);
    dashLine1.setAttribute('x2', end[0]);
    dashLine1.setAttribute('y2', end[1]);
    dashLine1.setAttribute("stroke", "red");
    dashLine1.setAttribute("stroke-dasharray", "50,50");
    dashLine1.setAttribute("stroke-width", 8);

    let dashLine2 = document.createElementNS( svgns, 'line' );
    dashLine2.setAttribute('x1', start[0]);
    dashLine2.setAttribute('y1', start[1]);
    dashLine2.setAttribute('x2', start[0]);
    dashLine2.setAttribute('y2', start[1]);
    dashLine2.setAttribute("stroke", "red");
    dashLine2.setAttribute("stroke-dasharray", "50,50");
    dashLine2.setAttribute("stroke-width", 8);

    map.appendChild(baseLine);
    map.appendChild(dashLine1);
    map.appendChild(dashLine2);
    return [baseLine, dashLine1, dashLine2];
}

function drawPlaneArrow(start, end) {
    let map = document.getElementById("map");

    let svgns = "http://www.w3.org/2000/svg";
    let polygon = document.createElementNS( svgns, 'polygon' );

    let lineDelta = [end[0]-start[0], end[1]-start[1]];
    let magnitude = Math.sqrt(lineDelta[0]*lineDelta[0] + lineDelta[1]*lineDelta[1]);
    lineDelta = [lineDelta[0]/magnitude, lineDelta[1]/magnitude];

    let cornerDelta=[-lineDelta[1], lineDelta[0]];

    let point1 = map.createSVGPoint();
    point1.x = end[0] + 15*cornerDelta[0];
    point1.y = end[1] + 15*cornerDelta[1];
    polygon.points.appendItem(point1);

    let point2 = map.createSVGPoint();
    point2.x = end[0] - 15*cornerDelta[0];
    point2.y = end[1] - 15*cornerDelta[1];
    polygon.points.appendItem(point2);

    let point3 = map.createSVGPoint();
    point3.x = end[0] + 60*lineDelta[0];
    point3.y = end[1] + 60*lineDelta[1];
    polygon.points.appendItem(point3);

    polygon.setAttribute("fill", "white");
    map.appendChild(polygon);
    return polygon;
}

function generatePlaneRoute() {
    function randomPlanePoint() {
        validRadius = 0.90 * 0.5 * 2000;
        let angle = Math.random() * 2 * Math.PI;
        return [1000+validRadius*Math.cos(angle), 1000+validRadius*Math.sin(angle)];
    }

    function validPlaneRoute(start, end) {
        let deltaX = 1000 - ((start[0] + end[0]) / 2);
        let deltaY = 1000 - ((start[1] + end[1]) / 2);
        let magnitude = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        return magnitude <= 400;
    }

    let start = randomPlanePoint();
    let end = randomPlanePoint();
    while(!validPlaneRoute(start, end)) {
        start = randomPlanePoint();
        end = randomPlanePoint();
    }
    let angle = Math.atan2(end[1]-start[1], end[0]-start[0]);

    [planeBase, planeDash1, planeDash2] = drawPlaneLine(start, end);
    planeStart = drawPlaneStartpoint(start);
    planeArrow = drawPlaneArrow(start, end);

    out = {
        start,
        end,
        angle,
        planeBase,
        planeDash1,
        planeDash2,
        planeStart,
        planeArrow
    };

    setupScrollingPlaneLine(out);
    showPlaneRoute(out, false);
    return out;
}

function setupScrollingPlaneLine(planeRoute) {
    let i = 0;
    let refreshTime = 20;
    let basePos = [parseFloat(planeRoute.planeDash1.getAttribute("x1")), parseFloat(planeRoute.planeDash1.getAttribute("y1"))];
    let endPos = [parseFloat(planeRoute.planeDash1.getAttribute("x2")), parseFloat(planeRoute.planeDash1.getAttribute("y2"))];
    let deltaPos = [endPos[0]-basePos[0], endPos[1]-basePos[1]];
    let magnitude = Math.sqrt(deltaPos[0]*deltaPos[0] + deltaPos[1]*deltaPos[1]);
    setInterval(() => {
        i++;
        let period = 20000;
        let multiple = ((i*refreshTime) % period) / period;

        let offsetFromStart = [deltaPos[0]*multiple, deltaPos[1]*multiple];
        let unionPos = [basePos[0]+offsetFromStart[0], basePos[1]+offsetFromStart[1]];
        
        planeRoute.planeDash1.setAttribute("x1", unionPos[0]);
        planeRoute.planeDash1.setAttribute("y1", unionPos[1]);
        planeRoute.planeDash2.setAttribute("x2", basePos[0]);
        planeRoute.planeDash2.setAttribute("y2", basePos[1]);

        let dash2Shift = [50*deltaPos[0]/magnitude, 50*deltaPos[1]/magnitude];
        planeRoute.planeDash2.setAttribute("x1", unionPos[0]+dash2Shift[0]);
        planeRoute.planeDash2.setAttribute("y1", unionPos[1]+dash2Shift[1]);
    }, refreshTime);
}

function drawPhaseCircle(center, radius) {
    let map = document.getElementById("map");

    let svgns = "http://www.w3.org/2000/svg";
    let circle = document.createElementNS( svgns, 'circle' );
    circle.setAttributeNS(null, 'cx', center[0]);
    circle.setAttributeNS(null, 'cy', center[1]);
    circle.setAttributeNS(null, 'r', radius);
    circle.setAttributeNS(null, 'stroke', 'white' );
    circle.setAttributeNS(null, 'stroke-width', 3 );
    circle.setAttributeNS(null, 'fill', 'none' );

    map.appendChild(circle);
    return circle;
}

function generatePhaseOne(planeRoute) {
    let previousRadius = 1000 * Math.sqrt(2);
    let radius = 500;
    
    let hardshift = (previousRadius - radius) * Math.random();
    let angle = Math.random() * 2 * Math.PI;
    let center = [1000+hardshift*Math.cos(angle), 1000-hardshift*Math.sin(angle)];
    let d1 = Math.sqrt(Math.pow(center[0]-planeRoute.start[0], 2) + Math.pow(center[1]-planeRoute.start[1], 2));
    let theta = Math.abs(planeRoute.angle - Math.atan2(center[1]-planeRoute.start[1], center[0]-planeRoute.start[0]));
    theta = (theta > Math.PI) ? Math.abs(theta - (2 * Math.PI)) : theta;

    while(getMaskPixel(Math.floor(center[0]), Math.floor(center[1])) > 0 || (d1 * Math.sin(theta)) > radius) {
        hardshift = (previousRadius - radius) * Math.random();
        angle = Math.random() * 2 * Math.PI;
        center = [1000+hardshift*Math.cos(angle), 1000-hardshift*Math.sin(angle)];
        d1 = Math.sqrt(Math.pow(center[0]-planeRoute.start[0], 2) + Math.pow(center[1]-planeRoute.start[1], 2));
        theta = Math.abs(planeRoute.angle - Math.atan2(center[1]-planeRoute.start[1], center[0]-planeRoute.start[0]));
        theta = (theta > Math.PI) ? Math.abs(theta - (2 * Math.PI)) : theta;
    }
    
    let phaseOneCircle = drawPhaseCircle(center, radius);
    return {
        hardshift,
        "angleRad" : angle,
        "angleDeg" : (angle * 180 / Math.PI),
        center,
        radius,
        "distanceFromPlane" : (d1 * Math.sin(theta)),
        "phaseCircle" : phaseOneCircle
    }
}

function generateArbitraryPhase(previousPhase, shrinkRatio, landRatio) {
    if(!landRatio) {
        let previousRadius = previousPhase.radius;
        let radius = previousRadius * shrinkRatio;

        let hardshift = (previousRadius - radius) * Math.pow(Math.random(), 0.56);
        let angle = Math.random() * 2 * Math.PI;
        let center = [previousPhase.center[0]+hardshift*Math.cos(angle), previousPhase.center[1]-hardshift*Math.sin(angle)];

        while(getMaskPixel(Math.floor(center[0]), Math.floor(center[1])) > 0) {
            hardshift = (previousRadius - radius) * Math.random();
            angle = Math.random() * 2 * Math.PI;
            center = [previousPhase.center[0]+hardshift*Math.cos(angle), previousPhase.center[1]-hardshift*Math.sin(angle)];
        }
        
        let phaseCircle = drawPhaseCircle(center, radius);
        return {
            hardshift,
            "angleRad" : angle,
            "angleDeg" : (angle * 180 / Math.PI),
            center,
            radius,
            phaseCircle
        }

    } else {
        let curCircle = {};
        let curBest = Number.MAX_SAFE_INTEGER;
        
        let landRatioTries = 100;
        for(let i = 1; i <= landRatioTries; i++) {
            let previousRadius = previousPhase.radius;
            let radius = previousRadius * shrinkRatio;

            let hardshift = (previousRadius - radius) * Math.pow(Math.random(), 0.56);
            let angle = Math.random() * 2 * Math.PI;
            let center = [previousPhase.center[0]+hardshift*Math.cos(angle), previousPhase.center[1]-hardshift*Math.sin(angle)];

            while(getMaskPixel(Math.floor(center[0]), Math.floor(center[1])) > 0) {
                hardshift = (previousRadius - radius) * Math.random();
                angle = Math.random() * 2 * Math.PI;
                center = [previousPhase.center[0]+hardshift*Math.cos(angle), previousPhase.center[1]-hardshift*Math.sin(angle)];
            }

            let waterCount = getNumberOfWaterPixelsInCircle(center, radius);
            if(waterCount < curBest) {
                curBest = waterCount;
                curCircle = {
                    hardshift,
                    "angleRad" : angle,
                    "angleDeg" : (angle * 180 / Math.PI),
                    center,
                    radius,
                    waterCount
                }
            }
        }

        let phaseCircle = drawPhaseCircle(curCircle.center, curCircle.radius);
        curCircle["phaseCircle"] = phaseCircle;
        return curCircle;
    }
}

function showPhaseCircle(phaseObj, visible) {
    phaseObj.phaseCircle.style.display = (visible) ? "inline" : "none";
}

function showNamedPhaseCircle(phasesObj, phaseNum, visible) {
    let name = "phase" + phaseNum + "Obj";
    showPhaseCircle(phasesObj[name], visible);
}

function showPlaneRoute(planeRouteObj, visible) {
    planeRouteObj.planeArrow.style.display = (visible) ? "inline" : "none";
    planeRouteObj.planeBase.style.display = (visible) ? "inline" : "none";
    planeRouteObj.planeDash1.style.display = (visible) ? "inline" : "none";
    planeRouteObj.planeDash2.style.display = (visible) ? "inline" : "none";
    planeRouteObj.planeStart.style.display = (visible) ? "inline" : "none";
}