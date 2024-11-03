function initZoomAndPan() {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    function getViewbox() {
        let cur = document.getElementById( 'map' ).getAttribute("viewBox").split(" ");
        let out = [];
        cur.forEach(element => {
            out.push(parseInt(element));
        })
        return out;
    }

    function updateViewbox(newViewbox) {
        document.getElementById( 'map' ).setAttribute("viewBox", newViewbox.join(" "));
    }

    function transformEdgeToCenter(box) {
        let out = [];
        out.push(box[0] + box[2] / 2);
        out.push(box[1] + box[3] / 2);
        out.push(box[2]);
        out.push(box[3]);
        return out;
    }

    function transformCenterToEdge(box) {
        let out = [];
        out.push(box[0] - box[2] / 2);
        out.push(box[1] - box[3] / 2);
        out.push(box[2]);
        out.push(box[3]);
        
        return out;
    }

    function zoomViewbox(targetX, targetY, amount) {
        if(getViewbox()[2] + amount >= 400) {
            let cur = transformEdgeToCenter(getViewbox());
            let oldCur = [...cur];
            cur[2] = clamp(cur[2] + amount, 0, 2000);
            cur[3] = clamp(cur[3] + amount, 0, 2000);
            cur[0] = targetX - cur[2] * ((targetX - cur[0]) / oldCur[2]);
            cur[1] = targetY - cur[3] * ((targetY - cur[1]) / oldCur[3]);

            cur = transformCenterToEdge(cur);
            cur[0] = clamp(cur[0], 0, 2000-cur[2]);
            cur[1] = clamp(cur[1], 0, 2000-cur[3]);
            return cur;
        }
        return getViewbox();
    }

    function panViewbox(initial, amountX, amountY) {
        let initialCopy = [...initial];
        initialCopy[0] = initialCopy[0] + amountX;
        initialCopy[1] = initialCopy[1] + amountY;

        initialCopy[0] = clamp(initialCopy[0], 0, 2000-initialCopy[2]);
        initialCopy[1] = clamp(initialCopy[1], 0, 2000-initialCopy[3]);

        return initialCopy;
    }

    let mousedown = false;
    let x = 0;
    let y = 0;
    let lockX = -1;
    let lockY = -1;
    let startDrag = getViewbox();

    let map = document.getElementById( 'map' );
    map.addEventListener("mouseup", function(event) { mousedown = false; map.style.cursor = "default" });
    map.addEventListener("mouseleave", function(event) { mousedown = false; map.style.cursor = "default" });
    map.addEventListener("mousedown", function(event) { mousedown = true; map.style.cursor = "grab" });

    map.addEventListener("mousemove", function(event) {
        x = event.layerX;
        y = event.layerY;
        if(mousedown) {
            if(lockX == -1 || lockY == -1) {
                lockX = x;
                lockY = y;
                startDrag = getViewbox();
            }
            offsetX = x - lockX;
            offsetY = y - lockY;
            let size = 0.90 * window.innerHeight;
            updateViewbox(panViewbox(startDrag, startDrag[2]*(-offsetX / size), startDrag[3]*(-offsetY / size)));
        } else {
            lockX = -1;
            lockY = -1;
        }
    });

    map.addEventListener("wheel", function(event) {
        let curCenter = transformEdgeToCenter(getViewbox());
        let size = 0.90 * window.innerHeight;
        curCenter[0] += curCenter[2] * ((x - (size / 2)) / size);
        curCenter[1] += curCenter[3] * ((y - (size / 2)) / size);
        updateViewbox(zoomViewbox(curCenter[0], curCenter[1], event.deltaY * 2));
    });
}