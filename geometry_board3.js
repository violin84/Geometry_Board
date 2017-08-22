/**
 * Created by Administrator on 2017/01/28 ~ 02/03.
 * 橡皮擦功能：mousemove经过时，mouseup会把它擦除
 */

function init()
{
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        btn_edit = document.getElementById('btn_edit'),
        btn_line = document.getElementById('btn_line'),
        btn_rect = document.getElementById('btn_rect'),
        btn_polygon = document.getElementById('btn_polygon'),
        btn_circle = document.getElementById('btn_circle'),
        btn_bezierCurve = document.getElementById('btn_bezierCurve'),
        btn_axis = document.getElementById('btn_axis'),
        btn_eraser = document.getElementById('btn_eraser'),

        isDown = false,
        drawing = false,
        editing = true,
        scaling = false,
        dragging = false,
        erasing = false,
        lineEditing = false,
        rectEditing = false,
        polygonEditing = false,
        circleEditing = false,
        bezierCurveEditing = false,

        showAxis = false,

        imageData,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        graphics = [],
        graphicsIndex_p = -1,

        line,
        line_width,
        line_height,
        lines = [],
        controlPoints_l = [],
        editIndex_l = -1,
        downPointIndex_l = -1,
        readyToDragPoints_l = [],
        beingControlled_l,

        rect,
        sides_rect = 4,
        rects = [],
        controlPoints_r = [],
        editIndex_r = -1,
        downPointIndex_r = -1,
        readyToDragPoints_r = [],
        beingControlled_r,

        polygon,
        radius_p,
        sides_polygon = 5,
        polygons = [],
        centers = [],
        controlPoints_p = [],
        editIndex_p = -1,
        downPointIndex_p = -1,
        readyToDragPoints_p = [],
        beingControlled_p,

        circle,
        circles = [],
        radius_c,
        circleCPCount = 4,
        controlPoints_c = [],
        editIndex_c = -1,
        downPointIndex_c = -1,
        readyToDragPoints_c = [],
        beingControlled_c,

        bezierCurve,
        bezierCurve_width,
        bezierCurve_height,
        bezierCurveCPCount = 4,
        bezierCurves = [],
        editIndex_b = -1,
        controlPoints_b = [],
        downPointIndex_b = -1,
        readyToDragPoints_b = [],
        beingControlled_b,

        CONTROL_POINT_RADIUS = 5,
        strokeStyle = 'black',
        fillStyle = 'green';


    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        isDown = true;
        if(lines.length == 0 && rects.length == 0 && polygons.length == 0 && circles.length == 0 && bezierCurves.length == 0)
        {
            drawing = true;
            readyTo();
        }
        else
        {
            checkMouseInControl();                                      //   检测鼠标是否点击控制点
            /*console.log('downPointIndex_l: ' + downPointIndex_l);
             console.log('downPointIndex_r: ' + downPointIndex_r);
             console.log('downPointIndex_p: ' + downPointIndex_p);*/
            // console.log('downPointIndex_c: ' + downPointIndex_c);
            // console.log('downPointIndex_p: ' + downPointIndex_p);
            if(downPointIndex_l != -1 || downPointIndex_r != -1 || downPointIndex_p != -1 || downPointIndex_c != -1 || downPointIndex_b != -1 )
            {
                scaling = true;
                canvas.style.cursor = 'crosshair';
                if(downPointIndex_l != -1)
                    beingControlled_l = lines[editIndex_l];
                else if(downPointIndex_r != -1)
                    beingControlled_r = rects[editIndex_r];
                else if(downPointIndex_p != -1)
                    beingControlled_p = polygons[editIndex_p];
                else if(downPointIndex_c != -1)
                    beingControlled_c = circles[editIndex_c];
                else if(downPointIndex_b != -1)
                    beingControlled_b = bezierCurves[editIndex_b];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                /*console.log('editIndex_l: ' + editIndex_l);
                 console.log('editIndex_r: ' + editIndex_r);
                 console.log('editIndex_p: ' + editIndex_p);*/
                // console.log('editIndex_c: ' + editIndex_c);
                if(editIndex_l != -1 || editIndex_r != -1 || editIndex_p != -1 || editIndex_c != -1 || editIndex_b != -1)
                {
                    dragging = true;
                    canvas.style.cursor = 'move';
                    if(editIndex_l != -1)
                    {
                        beingControlled_l = lines[editIndex_l];
                        draggingOffsetX = mousePos.x - beingControlled_l.x;
                        draggingOffsetY = mousePos.y - beingControlled_l.y;
                        line_width = controlPoints_l[editIndex_l*2+1].x - controlPoints_l[editIndex_l*2].x;
                        line_height = controlPoints_l[editIndex_l*2+1].y - controlPoints_l[editIndex_l*2].y;
                        drawBoundary_l();
                    }
                    else if(editIndex_r != -1)
                    {
                        beingControlled_r = rects[editIndex_r];
                        draggingOffsetX = mousePos.x - beingControlled_r.x;
                        draggingOffsetY = mousePos.y - beingControlled_r.y;
                        drawBoundary_r();
                    }
                    else if(editIndex_p != -1)
                    {
                        beingControlled_p = polygons[editIndex_p];
                        draggingOffsetX = mousePos.x - beingControlled_p.x;
                        draggingOffsetY = mousePos.y - beingControlled_p.y;
                        drawBoundary_p();
                    }
                    else if(editIndex_c != -1)
                    {
                        beingControlled_c = circles[editIndex_c];
                        draggingOffsetX = mousePos.x - beingControlled_c.x;
                        draggingOffsetY = mousePos.y - beingControlled_c.y;
                        drawBoundary_c();
                    }
                    else if(editIndex_b != -1)
                    {
                        beingControlled_b = bezierCurves[editIndex_b];
                        draggingOffsetX = mousePos.x - beingControlled_b.endx;
                        draggingOffsetY = mousePos.y - beingControlled_b.endy;
                        bezierCurve_width = beingControlled_b.endx2 - beingControlled_b.endx;
                        bezierCurve_height = beingControlled_b.endy2 - beingControlled_b.endy;
                        drawBoundary_b();
                    }
                }
            }
            if(!scaling && !dragging && !editing)
            {
                drawing = true;
                readyTo();
            }
        }
    };

    canvas.onmousemove = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            if(lineEditing)
                drawLine();
            else if(rectEditing)
                drawRect();
            else if(polygonEditing)
                drawPolygon();
            else if(circleEditing)
                drawCircle();
            else if(bezierCurveEditing)
                drawBezierCurve();
        }
        if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if(scaling)
            {
                if(editIndex_l != -1 || editIndex_r != -1 || editIndex_c != -1 || editIndex_b != -1)
                {
                    graphics.forEach( function(graphic){
                        graphic.stroke_fill(context);
                    } );
                    if(editIndex_l != -1)
                    {
                        scaleLine();
                        drawBoundary_l();
                    }
                    else if(editIndex_r != -1)
                    {
                        scaleRect();
                        drawBoundary_r();
                    }
                    else if(editIndex_c != -1)
                    {
                        scaleCircle();
                        drawBoundary_c();
                    }
                    else if(editIndex_b != -1)
                    {
                        scaleBezierCurve();
                        drawBoundary_b();
                    }
                }
                else if(editIndex_p != -1)
                {
                    graphics.forEach( function(graphic){
                        if(graphic != beingControlled_p)
                            graphic.stroke_fill(context);
                    } );
                    scalePolygon();
                    drawBoundary_p();
                }
            }
            else
            {
                graphics.forEach( function(graphic){
                    graphic.stroke_fill(context);
                } );
                if(editIndex_l != -1)
                {
                    dragLine();
                    drawBoundary_l();
                }
                if(editIndex_r != -1)
                {
                    dragRect();
                    drawBoundary_r();
                }
                if(editIndex_p != -1)
                {
                    dragPolygon();
                    drawBoundary_p();
                }
                if(editIndex_c != -1)
                {
                    dragCircle();
                    drawBoundary_c();
                }
                else if(editIndex_b != -1)
                {
                    dragBezierCurve();
                    drawBoundary_b();
                }
            }
        }
        else if(erasing && isDown)
        {
            erase();
        }
    };

    canvas.onmouseup = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        canvas.style.cursor = 'default';

        /*if(mousePos.x == mousedown.x && mousePos.y == mousedown.y)
            return;*/

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            if(lineEditing)
                drawLineUp();
            else if(rectEditing)
                drawRectUp();
            else if(polygonEditing)
                drawPolygonUp();
            else if(circleEditing)
                drawCircleUp();
            else if(bezierCurveEditing)
                drawBezierCurveUp();
        }
        else if(scaling)
        {
            if(editIndex_l != -1)
                scaleLineUp();
            else if(editIndex_r != -1)
                scaleRectUp();
            else if(editIndex_p != -1)
                scalePolygonUp();
            else if(editIndex_c != -1)
                scaleCircleUp();
            else if(editIndex_b != -1)
                scaleBezierCurveUp();
        }
        else if(dragging)
        {
            if(editIndex_l != -1)
                dragLineUp();
            else if(editIndex_r != -1)
                dragRectUp();
            else if(editIndex_p != -1)
                dragPolygonUp();
            else if(editIndex_c != -1)
                dragCircleUp();
            else if(editIndex_b != -1)
                dragBezierCurveUp();
        }
        else if(erasing && isDown)
        {
            eraseUp();
        }
        isDown = false;
        drawing = false;
        scaling = false;
        dragging = false;
    };


    function readyTo()
    {
        canvas.style.cursor = 'crosshair';
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        mousedown.x = mousePos.x;
        mousedown.y = mousePos.y;
        if(polygonEditing)
            centers.push({x:mousedown.x,  y:mousedown.y});
    }

    function updateBoundary()
    {
        movingRezone.width = mousePos.x - mousedown.x;
        movingRezone.height = mousePos.y - mousedown.y;
        if(mousePos.x > mousedown.x)     movingRezone.left = mousedown.x;
        else                             movingRezone.left = mousePos.x;
        if(mousePos.y > mousedown.y)     movingRezone.top = mousedown.y;
        else                             movingRezone.top = mousePos.y;
    }

    /*  ------------------- Eraser -------------------  */
    function erase()
    {
        context.save();
        context.beginPath();
        context.arc(mousePos.x, mousePos.y, 20, 0, 2*Math.PI);
        context.clip();
        context.clearRect(0,0,canvas.width,canvas.height);
        context.restore();
        if(graphics.length > 0)
        {
            for(var i = graphics.length-1;  i >= 0;  i--) {
                graphics[i].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    //console.log('i: ' + i);
                    graphics.splice(i, 1);
                    removeGraphics(lines);
                    removeGraphics(rects);
                    removeGraphics(polygons);
                    removeGraphics(circles);
                    removeGraphics(bezierCurves);
                }
            }
        }
    }

    function removeGraphics(arr)
    {
        if(arr.length > 0)
        {
            for(var i = arr.length-1;  i >= 0;  i--) {
                arr[i].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    console.log('i: ' + i);
                    arr.splice(i, 1);
                }
            }
        }
    }

    function eraseUp()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        graphics.forEach( function(graphic){
            graphic.stroke_fill(context);
        } );
    }

    /*  ------------------- Line -------------------  */
    function drawBoundary_l()
    {
        beingControlled_l.drawRubberbandRect(context, beingControlled_l.x,  beingControlled_l.y,  beingControlled_l.x2,  beingControlled_l.y2);
    }


    //  画线
    function drawLine()
    {
        updateBoundary();
        line = new Line(mousedown.x,  mousedown.y,  mousePos.x,  mousePos.y, 'black');
        line.stroke(context);
    }

    //  画线完毕
    function drawLineUp()
    {
        drawLine();
        lines.push(line);
        graphics.push(line);
        controlPoints_l.push({x:mousedown.x,  y:mousedown.y});
        controlPoints_l.push({x:mousePos.x,  y:mousePos.y});
        beingControlled_l = line;
        drawBoundary_l();
        editIndex_l = lines.length - 1;
    }

    //  缩放直线
    function scaleLine()
    {
        if(downPointIndex_l == 0)
        {
            beingControlled_l.x = mousePos.x;
            beingControlled_l.y = mousePos.y;
        }
        else
        {
            beingControlled_l.x2 = mousePos.x;
            beingControlled_l.y2 = mousePos.y;
        }
    }

    //  缩放直线完毕
    function scaleLineUp()
    {
        setControPoints_l();
    }

    //  拖动直线
    function dragLine()
    {
        beingControlled_l.x = mousePos.x - draggingOffsetX;
        beingControlled_l.y = mousePos.y - draggingOffsetY;
        beingControlled_l.x2 = beingControlled_l.x + line_width;
        beingControlled_l.y2 = beingControlled_l.y + line_height;
    }

    //  拖动直线完毕
    function dragLineUp()
    {
        setControPoints_l();
    }

    function setControPoints_l()
    {
        controlPoints_l[editIndex_l*2].x = beingControlled_l.x;
        controlPoints_l[editIndex_l*2].y = beingControlled_l.y;
        controlPoints_l[editIndex_l*2+1].x = beingControlled_l.x2;
        controlPoints_l[editIndex_l*2+1].y = beingControlled_l.y2;
    }



    /*  ------------------- Rectangle -------------------  */
    function drawBoundary_r()
    {
        beingControlled_r.drawRubberbandRect(context, beingControlled_r.x,  beingControlled_r.y,  beingControlled_r.width,  beingControlled_r.height);
    }

    //  画矩形
    function drawRect()
    {
        updateBoundary();
        rect = new Rectangle(mousedown.x,  mousedown.y,  movingRezone.width,  movingRezone.height, strokeStyle, fillStyle);
        rect.stroke_fill(context);
    }

    //  画矩形完毕
    function drawRectUp()
    {
        drawRect();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            rects.push(rect);
            graphics.push(rect);
            controlPoints_r.push({x:mousedown.x,  y:mousedown.y});
            controlPoints_r.push({x:mousePos.x,  y:mousedown.y});
            controlPoints_r.push({x:mousePos.x,  y:mousePos.y});
            controlPoints_r.push({x:mousedown.x,  y:mousePos.y});
            beingControlled_r = rect;
            editIndex_r = rects.length - 1;
            drawBoundary_r();
        }
    }

    //  缩放矩形
    function scaleRect()
    {
        var width, height;
        if(downPointIndex_r == 0)
        {
            beingControlled_r.x = mousePos.x;
            beingControlled_r.y = mousePos.y;
            width = controlPoints_r[editIndex_r*sides_rect+2].x - mousePos.x;
            height = controlPoints_r[editIndex_r*sides_rect+2].y - mousePos.y;
        }
        else if(downPointIndex_r == 1)
        {
            beingControlled_r.x = controlPoints_r[editIndex_r*sides_rect].x;
            beingControlled_r.y = mousePos.y;
            width = mousePos.x - controlPoints_r[editIndex_r*sides_rect+3].x;
            height = controlPoints_r[editIndex_r*sides_rect+3].y - mousePos.y;
        }
        else if(downPointIndex_r == 2)
        {
            beingControlled_r.x = controlPoints_r[editIndex_r*sides_rect].x;
            beingControlled_r.y = controlPoints_r[editIndex_r*sides_rect].y;
            width = mousePos.x - controlPoints_r[editIndex_r*sides_rect].x;
            height = mousePos.y - controlPoints_r[editIndex_r*sides_rect].y;
        }
        else
        {
            beingControlled_r.x = controlPoints_r[editIndex_r*sides_rect+1].x;
            beingControlled_r.y = controlPoints_r[editIndex_r*sides_rect+1].y;
            width = mousePos.x - controlPoints_r[editIndex_r*sides_rect+1].x;
            height = mousePos.y - controlPoints_r[editIndex_r*sides_rect+1].y;
        }
        beingControlled_r.width = width;
        beingControlled_r.height = height;
    }

    //  缩放矩形完毕
    function scaleRectUp()
    {
        setControPoints_r();
    }

    //  拖动矩形
    function dragRect()
    {
        beingControlled_r.x = mousePos.x - draggingOffsetX;
        beingControlled_r.y = mousePos.y - draggingOffsetY;
    }

    //  拖动矩形完毕
    function dragRectUp()
    {
        setControPoints_r();
    }

    function setControPoints_r()
    {
        controlPoints_r[editIndex_r*sides_rect].x = beingControlled_r.x;
        controlPoints_r[editIndex_r*sides_rect].y = beingControlled_r.y;
        controlPoints_r[editIndex_r*sides_rect+1].x = beingControlled_r.x + beingControlled_r.width;
        controlPoints_r[editIndex_r*sides_rect+1].y = beingControlled_r.y;
        controlPoints_r[editIndex_r*sides_rect+2].x = beingControlled_r.x + beingControlled_r.width;
        controlPoints_r[editIndex_r*sides_rect+2].y = beingControlled_r.y + beingControlled_r.height;
        controlPoints_r[editIndex_r*sides_rect+3].x = beingControlled_r.x;
        controlPoints_r[editIndex_r*sides_rect+3].y = beingControlled_r.y + beingControlled_r.height;
    }


    /*  ------------------- Polygon -------------------  */
    function drawBoundary_p()
    {
        beingControlled_p.drawRubberbandRect(context, beingControlled_p.getPoints());
    }


    //  画多边形
    function drawPolygon()
    {
        updateBoundary();
        radius_p = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        polygon = new Polygon(mousedown.x,  mousedown.y,  radius_p,  sides_polygon,  0, strokeStyle, fillStyle);
        polygon.stroke_fill(context);
        beingControlled_p = polygon;
        graphics[graphicsIndex_p] = beingControlled_p;
    }

    //  画多边形完毕
    function drawPolygonUp()
    {
        drawPolygon();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            polygons.push(polygon);
            graphics.push(polygon);
            beingControlled_p = polygon;
            editIndex_p = polygons.length - 1;
            var points = polygon.getPoints();
            for(var i = 0; i < sides_polygon; i++)
            {
                controlPoints_p.push({x:points[i].x,  y:points[i].y});
            }
            drawBoundary_p();
        }
    }

    //  缩放多边形
    function scalePolygon()
    {
        movingRezone.width = mousePos.x - centers[editIndex_p].x;
        movingRezone.height = mousePos.y - centers[editIndex_p].y;
        radius_p = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        beingControlled_p.radius = radius_p;
        beingControlled_p.stroke_fill(context);
    }

    //  缩放多边形完毕
    function scalePolygonUp()
    {
        setControPoints_p();
    }

    //  拖动多边形
    function dragPolygon()
    {
        beingControlled_p.x = mousePos.x - draggingOffsetX;
        beingControlled_p.y = mousePos.y - draggingOffsetY;
    }

    //  拖动多边形完毕
    function dragPolygonUp()
    {
        setControPoints_p();
        centers[editIndex_p].x = mousePos.x - draggingOffsetX;
        centers[editIndex_p].y = mousePos.y - draggingOffsetY;
    }

    function setControPoints_p()
    {
        var points = beingControlled_p.getPoints();
        for(var i = 0; i < sides_polygon; i++)
        {
            controlPoints_p[editIndex_p*sides_polygon+i] = points[i];
        }
    }


    /*  ------------------- Circle -------------------  */
    function drawBoundary_c()
    {
        beingControlled_c.drawRubberbandRect(context, beingControlled_c.x,  beingControlled_c.y,  beingControlled_c.radius);
    }

    //  画圆
    function drawCircle()
    {
        updateBoundary();
        radius_c = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        circle = new Circle(mousedown.x,  mousedown.y,  radius_c, strokeStyle, fillStyle);
        circle.stroke_fill(context);
    }

    //  画圆完毕
    function drawCircleUp()
    {
        drawCircle();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            circles.push(circle);
            graphics.push(circle);
            controlPoints_c.push({x:mousedown.x,  y:mousedown.y-radius_c});
            controlPoints_c.push({x:mousedown.x+radius_c,  y:mousedown.y});
            controlPoints_c.push({x:mousedown.x,  y:mousedown.y+radius_c});
            controlPoints_c.push({x:mousedown.x-radius_c,  y:mousedown.y});
            beingControlled_c = circle;
            editIndex_c = circles.length - 1;
            drawBoundary_c();
        }
    }

    //  缩放圆
    function scaleCircle()
    {
        movingRezone.width = mousePos.x - beingControlled_c.x;
        movingRezone.height = mousePos.y - beingControlled_c.y;
        radius_c = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        beingControlled_c.radius = radius_c;
    }

    //  缩放圆完毕
    function scaleCircleUp()
    {
        setControPoints_c();
    }

    //  拖动圆
    function dragCircle()
    {
        beingControlled_c.x = mousePos.x - draggingOffsetX;
        beingControlled_c.y = mousePos.y - draggingOffsetY;
    }

    //  拖动圆完毕
    function dragCircleUp()
    {
        setControPoints_c();
    }

    function setControPoints_c()
    {
        controlPoints_c[editIndex_c*circleCPCount] = {x:beingControlled_c.x,  y:beingControlled_c.y-beingControlled_c.radius};
        controlPoints_c[editIndex_c*circleCPCount+1] = {x:beingControlled_c.x+beingControlled_c.radius,  y:beingControlled_c.y};
        controlPoints_c[editIndex_c*circleCPCount+2] = {x:beingControlled_c.x,  y:beingControlled_c.y+beingControlled_c.radius};
        controlPoints_c[editIndex_c*circleCPCount+3] = {x:beingControlled_c.x-beingControlled_c.radius,  y:beingControlled_c.y};
    }


    /*  ------------------- BezierCurve -------------------  */
    function drawBoundary_b()
    {
        beingControlled_b.drawRubberbandRect(context, beingControlled_b.endx,  beingControlled_b.endy,
            beingControlled_b.controlx,  beingControlled_b.controly,
            beingControlled_b.controlx2,  beingControlled_b.controly2,
            beingControlled_b.endx2,  beingControlled_b.endy2);
    }

    //  画贝塞尔曲线
    function drawBezierCurve()
    {
        updateBoundary();
        bezierCurve = new BezierCurve(mousedown.x,  mousedown.y,
            mousedown.x,  mousedown.y + movingRezone.height,
            mousedown.x + movingRezone.width,  mousedown.y,
            mousedown.x + movingRezone.width,  mousedown.y + movingRezone.height,
            strokeStyle, fillStyle);
        bezierCurve.stroke_fill(context);
    }

    //  画贝塞尔曲线完毕
    function drawBezierCurveUp()
    {
        drawBezierCurve();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            bezierCurves.push(bezierCurve);
            graphics.push(bezierCurve);
            controlPoints_b.push({x:mousedown.x,  y:mousedown.y});
            controlPoints_b.push({x:mousedown.x,  y:mousedown.y + movingRezone.height});
            controlPoints_b.push({x:mousedown.x + movingRezone.width,  y:mousedown.y});
            controlPoints_b.push({x:mousedown.x + movingRezone.width,  y:mousedown.y + movingRezone.height});
            beingControlled_b = bezierCurve;
            editIndex_b = bezierCurves.length - 1;
            drawBoundary_b();
        }
    }

    //  缩放贝塞尔曲线
    function scaleBezierCurve()
    {
        if(downPointIndex_b == 0)
        {
            beingControlled_b.endx = mousePos.x;
            beingControlled_b.endy = mousePos.y;
            beingControlled_b.controlx = mousePos.x;
            beingControlled_b.controly2 = mousePos.y;
        }
        else if(downPointIndex_b == 1)
        {
            beingControlled_b.endx = mousePos.x;
            beingControlled_b.controlx = mousePos.x;
            beingControlled_b.controly = mousePos.y;
            beingControlled_b.endy2 = mousePos.y;
        }
        else if(downPointIndex_b == 2)
        {
            beingControlled_b.endy = mousePos.y;
            beingControlled_b.controlx2 = mousePos.x;
            beingControlled_b.controly2 = mousePos.y;
            beingControlled_b.endx2 = mousePos.x;
        }
        else
        {
            beingControlled_b.controly = mousePos.y;
            beingControlled_b.controlx2 = mousePos.x;
            beingControlled_b.endx2 = mousePos.x;
            beingControlled_b.endy2 = mousePos.y;
        }
    }

    //  缩放贝塞尔曲线完毕
    function scaleBezierCurveUp()
    {
        setControPoints_b();
    }

    //  拖动贝塞尔曲线
    function dragBezierCurve()
    {
        beingControlled_b.endx = mousePos.x - draggingOffsetX;
        beingControlled_b.endy = mousePos.y - draggingOffsetY;
        beingControlled_b.controlx = beingControlled_b.endx;
        beingControlled_b.controly = beingControlled_b.endy + bezierCurve_height;
        beingControlled_b.controlx2 = beingControlled_b.endx + bezierCurve_width;
        beingControlled_b.controly2 = beingControlled_b.endy;
        beingControlled_b.endx2 = beingControlled_b.controlx2;
        beingControlled_b.endy2 = beingControlled_b.controly;
    }

    //  拖动贝塞尔曲线完毕
    function dragBezierCurveUp()
    {
        setControPoints_b();
    }

    function setControPoints_b()
    {
        controlPoints_b[editIndex_b*bezierCurveCPCount].x = beingControlled_b.endx;
        controlPoints_b[editIndex_b*bezierCurveCPCount].y = beingControlled_b.endy;
        controlPoints_b[editIndex_b*bezierCurveCPCount+1].x = beingControlled_b.controlx;
        controlPoints_b[editIndex_b*bezierCurveCPCount+1].y = beingControlled_b.controly;
        controlPoints_b[editIndex_b*bezierCurveCPCount+2].x = beingControlled_b.controlx2;
        controlPoints_b[editIndex_b*bezierCurveCPCount+2].y = beingControlled_b.controly2;
        controlPoints_b[editIndex_b*bezierCurveCPCount+3].x = beingControlled_b.endx2;
        controlPoints_b[editIndex_b*bezierCurveCPCount+3].y = beingControlled_b.endy2;
    }


    /*  ------------------- Axis -------------------  */
    // 画坐标轴
    function drawAxis()
    {
        context.save();
        context.strokeStyle = "#00ff99";
        context.moveTo(0, canvas.height/2);
        context.lineTo(canvas.width, canvas.height/2);
        context.stroke();
        context.moveTo(canvas.width/2, 0);
        context.lineTo(canvas.width/2, canvas.height);
        context.stroke();
        context.restore();
    }

    // 隐藏坐标轴
    function hideAxis()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }


    /*  ------------------- Check -------------------  */
    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        if(editIndex_l != -1)
        {
            readyToDragPoints_l[0] = controlPoints_l[editIndex_l*2];
            readyToDragPoints_l[1] = controlPoints_l[editIndex_l*2+1];
            for(var i = 0;  i < readyToDragPoints_l.length;  i++)
            {
                drawPointPath(readyToDragPoints_l[i].x, readyToDragPoints_l[i].y);
                if( context.isPointInPath(mousePos.x, mousePos.y) )
                {
                    downPointIndex_l = i;
                    return;
                }
                else
                    downPointIndex_l = -1;
            }
        }

        if(editIndex_r != -1)
        {
            for(var n = 0; n < sides_rect; n++)
            {
                readyToDragPoints_r[n] = controlPoints_r[editIndex_r*sides_rect+n];
            }
            for(var j = 0;  j < sides_rect;  j++)
            {
                drawPointPath(readyToDragPoints_r[j].x, readyToDragPoints_r[j].y);
                if( context.isPointInPath(mousePos.x, mousePos.y) )
                {
                    downPointIndex_r = j;
                    return;
                }
                else
                    downPointIndex_r = -1;
            }
        }

        if(editIndex_p != -1)
        {
            for(var m = 0; m < sides_polygon; m++)
            {
                readyToDragPoints_p[m] = controlPoints_p[editIndex_p*sides_polygon+m];
            }
            for(var k = 0;  k < sides_polygon;  k++)
            {
                drawPointPath(readyToDragPoints_p[k].x, readyToDragPoints_p[k].y);
                if( context.isPointInPath(mousePos.x, mousePos.y) )
                {
                    downPointIndex_p = k;
                    return;
                }
                else
                    downPointIndex_p = -1;
            }
        }

        if(editIndex_c != -1)
        {
            for(var r = 0; r < circleCPCount; r++)
            {
                readyToDragPoints_c[r] = controlPoints_c[editIndex_c*circleCPCount+r];
            }
            for(var ii = 0;  ii < circleCPCount;  ii++)
            {
                drawPointPath(readyToDragPoints_c[ii].x, readyToDragPoints_c[ii].y);
                if( context.isPointInPath(mousePos.x, mousePos.y) )
                {
                    downPointIndex_c = ii;
                    return;
                }
                else
                    downPointIndex_c = -1;
            }
        }

        if(editIndex_b != -1)
        {
            for(var s = 0; s < bezierCurveCPCount; s++)
            {
                readyToDragPoints_b[s] = controlPoints_b[controlPoints_b.length - bezierCurveCPCount + s];
            }
            for(var jj = 0;  jj < bezierCurveCPCount;  jj++)
            {
                drawPointPath(readyToDragPoints_b[jj].x, readyToDragPoints_b[jj].y);
                if( context.isPointInPath(mousePos.x, mousePos.y) )
                {
                    downPointIndex_b = jj;
                    return;
                }
                else
                    downPointIndex_b = -1;
            }
        }
    }

    //  控制点路径
    function drawPointPath(x, y)
    {
        context.beginPath();
        context.arc(x, y, CONTROL_POINT_RADIUS, 0, Math.PI*2);
    }

    //   检测鼠标是否点路径
    function checkMouseInPath()
    {
        if(!erasing)
        {
            console.log('graphics.length: ' + graphics.length);
            context.clearRect(0, 0, canvas.width, canvas.height);
            graphics.forEach( function(graphic){
                graphic.stroke_fill(context);
            } );
        }
        editIndex_l = -1;
        editIndex_r = -1;
        editIndex_p = -1;
        editIndex_c = -1;
        editIndex_b = -1;

        if(lines.length > 0)
        {
            for(var i = lines.length-1;  i >= 0;  i--) {
                lines[i].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    editIndex_l = i;
                    return;
                }
                else
                    editIndex_l = -1;
            }
        }

        if(rects.length > 0)
        {
            for(var j = rects.length-1;  j >= 0;  j--) {
                rects[j].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    editIndex_r = j;
                    return;
                }
                else
                    editIndex_r = -1;
            }
        }

        if(polygons.length > 0)
        {
            for(var k = polygons.length-1;  k >= 0;  k--) {
                polygons[k].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    editIndex_p = k;
                    return;
                }
                else
                    editIndex_p = -1;
            }
        }

        if(circles.length > 0)
        {
            for(var ii = circles.length-1;  ii >= 0;  ii--) {
                circles[ii].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    editIndex_c = ii;
                    return;
                }
                else
                    editIndex_c = -1;
            }
        }

        if(bezierCurves.length > 0)
        {
            for(var jj = bezierCurves.length-1;  jj >= 0;  jj--) {
                bezierCurves[jj].createPath(context);
                if (context.isPointInPath(mousePos.x, mousePos.y))
                {
                    editIndex_b = jj;
                    return;
                }
                else
                    editIndex_b = -1;
            }
        }
    }


    function windowToCanvas(x, y)
    {
        var box = canvas.getBoundingClientRect();
        return {x:x - box.left * (canvas.width / box.width),
            y:y - box.top * (canvas.height / box.height)};
    }


    btn_line.onclick = function()
    {
        initFalse();
        lineEditing = true;
    };

    btn_rect.onclick = function()
    {
        initFalse();
        rectEditing = true;
    };

    btn_polygon.onclick = function()
    {
        initFalse();
        polygonEditing = true;
    };

    btn_circle.onclick = function()
    {
        initFalse();
        circleEditing = true;
    };

    btn_bezierCurve.onclick = function()
    {
        initFalse();
        bezierCurveEditing = true;
    };

    btn_axis.onclick = function()
    {
        showAxis = !showAxis;
        if(showAxis)
            drawAxis();
        else
            hideAxis();
    };

    btn_eraser.onclick = function()
    {
        erasing = true;
        canvas.style.cursor = 'wait';
    };

    btn_edit.onclick = function()
    {
        erasing = false;
        editing = true;
        canvas.style.cursor = 'move';
    };


    function initFalse()
    {
        lineEditing = false;
        rectEditing = false;
        polygonEditing = false;
        circleEditing = false;
        bezierCurveEditing = false;
        erasing = false;
        editing = false;
    }



}
