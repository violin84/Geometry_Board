/**
 * Created by Administrator on 2017/01/26 ~ 01/27.
 * scale,drag 时排序出错，在于clearRect之后用for循环重画，导致先画所有的line，再画所有的rect，最后画所有的polygon
 */


function init()
{
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        btn_line = document.getElementById('btn_line'),
        btn_rect = document.getElementById('btn_rect'),
        btn_polygon = document.getElementById('btn_polygon'),

        imageData = {},
        drawing = false,
        scaling = false,
        dragging = false,
        lineEditing = false,
        rectEditing = false,
        polygonEditing = false,

        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        CONTROL_POINT_RADIUS = 5,
        strokeStyle = 'black',
        fillStyle = 'green',

        editIndex_l = -1,
        line,
        lines = [],
        controlPoints_l = [],
        downPointIndex_l = -1,
        readyToDragPoints_l = [],
        beingControlled_l,

        editIndex_r = -1,
        rect,
        rects = [],
        sides_rect = 4,
        controlPoints_r = [],
        downPointIndex_r = -1,
        readyToDragPoints_r = [],
        beingControlled_r,

        editIndex_p = -1,
        polygon,
        polygons = [],
        radius,
        sides_polygon = 5,
        centers = [],
        controlPoints_p = [],
        downPointIndex_p = -1,
        readyToDragPoints_p = [],
        beingControlled_p;


    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(lines.length == 0 && rects.length == 0 && polygons.length == 0)
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
            if(downPointIndex_l != -1 || downPointIndex_r != -1 || downPointIndex_p != -1)
            {
                scaling = true;
                if(downPointIndex_l != -1)
                    beingControlled_l = lines[editIndex_l];
                else if(downPointIndex_r != -1)
                    beingControlled_r = rects[editIndex_r];
                else
                    beingControlled_p = polygons[editIndex_p];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                console.log('editIndex_l: ' + editIndex_l);
                console.log('editIndex_r: ' + editIndex_r);
                console.log('editIndex_p: ' + editIndex_p);
                if(editIndex_l != -1 || editIndex_r != -1 || editIndex_p != -1)
                {
                    dragging = true;
                    if(editIndex_l != -1)
                    {
                        beingControlled_l = lines[editIndex_l];
                        draggingOffsetX = mousePos.x - beingControlled_l.x;
                        draggingOffsetY = mousePos.y - beingControlled_l.y;
                        readyToDragPoints_l[0] = controlPoints_l[editIndex_l*2];
                        readyToDragPoints_l[1] = controlPoints_l[editIndex_l*2+1];
                        drawBoundary_l();
                    }
                    else if(editIndex_r != -1)
                    {
                        beingControlled_r = rects[editIndex_r];
                        draggingOffsetX = mousePos.x - beingControlled_r.x;
                        draggingOffsetY = mousePos.y - beingControlled_r.y;
                        for(var i = 0; i < sides_rect; i++)
                        {
                            readyToDragPoints_r[i] = controlPoints_r[editIndex_r*sides_rect+i];
                        }
                        drawBoundary_r();
                    }
                    else
                    {
                        beingControlled_p = polygons[editIndex_p];
                        draggingOffsetX = mousePos.x - beingControlled_p.x;
                        draggingOffsetY = mousePos.y - beingControlled_p.y;
                        for(var i = 0; i < sides_rect; i++)
                        {
                            readyToDragPoints_p[i] = controlPoints_p[editIndex_p*sides_polygon+i];
                        }
                        drawBoundary_p();
                    }
                }
            }
            if(!scaling && !dragging)
            {
                drawing = true;
                readyTo();
            }
        }
    }

    canvas.onmousemove = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            if(lineEditing)
                drawLine();
            if(rectEditing)
                drawRect();
            if(polygonEditing)
                drawPolygon();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            lines.forEach( function(line){
                line.stroke(context);
            } )
            rects.forEach( function(rect){
                rect.stroke_fill(context);
            } )
            if(scaling)
            {
                if(editIndex_l != -1)
                {
                    polygons.forEach( function(polygon){
                        polygon.stroke_fill(context);
                    } )
                    scaleLine();
                    drawBoundary_l();
                }
                if(editIndex_r != -1)
                {
                    polygons.forEach( function(polygon){
                        polygon.stroke_fill(context);
                    } )
                    scaleRect();
                    drawBoundary_r();
                }
                if(editIndex_p != -1)
                {
                    polygons.forEach( function(polygon){
                        if(polygon != beingControlled_p)
                            polygon.stroke_fill(context);
                    } )
                    scalePolygon();
                    drawBoundary_p();
                }
            }
            else
            {
                polygons.forEach( function(polygon){
                    polygon.stroke_fill(context);
                } )
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
            }
        }
    }

    canvas.onmouseup = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        /*if(mousePos.x == mousedown.x && mousePos.y == mousedown.y)
            return;*/

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            if(lineEditing)
                drawLineUp();
            if(rectEditing)
                drawRectUp();
            if(polygonEditing)
                drawPolygonUp();
        }
        else if(scaling)
        {
            if(editIndex_l != -1)
                scaleLineUp();
            if(editIndex_r != -1)
                scaleRectUp();
            if(editIndex_p != -1)
                scalePolygonUp();
        }
        else if(dragging)
        {
            if(editIndex_l != -1)
                dragLineUp();
            if(editIndex_r != -1)
                dragRectUp();
            if(editIndex_p != -1)
                dragPolygonUp();
        }
        drawing = false;
        scaling = false;
        dragging = false;
    }


    function readyTo()
    {
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
        controlPoints_l.push({x:mousedown.x,  y:mousedown.y});
        controlPoints_l.push({x:mousePos.x,  y:mousePos.y});
        readyToDragPoints_l[0] = controlPoints_l[controlPoints_l.length - 2];
        readyToDragPoints_l[1] = controlPoints_l[controlPoints_l.length - 1];
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
        if(downPointIndex_l == 0)
        {
            controlPoints_l[editIndex_l*2].x = mousePos.x;
            controlPoints_l[editIndex_l*2].y = mousePos.y;
        }
        else
        {
            controlPoints_l[editIndex_l*2+1].x = mousePos.x;
            controlPoints_l[editIndex_l*2+1].y = mousePos.y;
        }
    }

    //  拖动直线
    function dragLine()
    {
        beingControlled_l.x = mousePos.x - draggingOffsetX;
        beingControlled_l.y = mousePos.y - draggingOffsetY;
        beingControlled_l.x2 = beingControlled_l.x + (readyToDragPoints_l[1].x - readyToDragPoints_l[0].x);
        beingControlled_l.y2 = beingControlled_l.y + (readyToDragPoints_l[1].y - readyToDragPoints_l[0].y);
    }

    //  拖动直线完毕
    function dragLineUp()
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
            controlPoints_r.push({x:mousedown.x,  y:mousedown.y});
            controlPoints_r.push({x:mousePos.x,  y:mousedown.y});
            controlPoints_r.push({x:mousePos.x,  y:mousePos.y});
            controlPoints_r.push({x:mousedown.x,  y:mousePos.y});
            for(var i = 0; i < sides_rect; i++)
            {
                readyToDragPoints_r[i] = controlPoints_r[controlPoints_r.length - sides_rect + i];
            }
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
            width = readyToDragPoints_r[2].x - mousePos.x;
            height = readyToDragPoints_r[2].y - mousePos.y;
        }
        else if(downPointIndex_r == 1)
        {
            beingControlled_r.x = readyToDragPoints_r[0].x;
            beingControlled_r.y = mousePos.y;
            width = mousePos.x - readyToDragPoints_r[3].x;
            height = readyToDragPoints_r[3].y - mousePos.y;
        }
        else if(downPointIndex_r == 2)
        {
            beingControlled_r.x = readyToDragPoints_r[0].x;
            beingControlled_r.y = readyToDragPoints_r[0].y;
            width = mousePos.x - readyToDragPoints_r[0].x;
            height = mousePos.y - readyToDragPoints_r[0].y;
        }
        else
        {
            beingControlled_r.x = readyToDragPoints_r[1].x;
            beingControlled_r.y = readyToDragPoints_r[1].y;
            width = mousePos.x - readyToDragPoints_r[1].x;
            height = mousePos.y - readyToDragPoints_r[1].y;
        }
        beingControlled_r.width = width;
        beingControlled_r.height = height;
    }

    //  缩放矩形完毕
    function scaleRectUp()
    {
        if(downPointIndex_r == 0)
        {
            controlPoints_r[editIndex_r*sides_rect].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+1].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+3].x = mousePos.x;
        }
        else if(downPointIndex_r == 1)
        {
            controlPoints_r[editIndex_r*sides_rect].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+1].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect+1].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+2].x = mousePos.x;
        }
        else if(downPointIndex_r == 2)
        {
            controlPoints_r[editIndex_r*sides_rect+1].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect+2].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect+2].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+3].y = mousePos.y;
        }
        else if(downPointIndex_r == 3)
        {
            controlPoints_r[editIndex_r*sides_rect].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect+2].y = mousePos.y;
            controlPoints_r[editIndex_r*sides_rect+3].x = mousePos.x;
            controlPoints_r[editIndex_r*sides_rect+3].y = mousePos.y;
        }
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
        var points = beingControlled_p.getPoints();
        for(var i = 0; i < sides_polygon; i++)
        {
            readyToDragPoints_p[i] = points[i];
        }
        beingControlled_p.drawRubberbandRect(context, readyToDragPoints_p);
    }


    //  画多边形
    function drawPolygon()
    {
        updateBoundary();
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        polygon = new Polygon(mousedown.x,  mousedown.y,  radius,  sides_polygon,  0, strokeStyle, fillStyle);
        polygon.stroke_fill(context);
        beingControlled_p = polygon;
    }

    //  画多边形完毕
    function drawPolygonUp()
    {
        drawPolygon();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            polygons.push(polygon);
            beingControlled_p = polygon;
            editIndex_p = polygons.length - 1;
            var points = polygon.getPoints();
            for(var i = 0; i < sides_polygon; i++)
            {
                controlPoints_p.push({x:points[i].x,  y:points[i].y});
                readyToDragPoints_p[i] = controlPoints_p[editIndex_p * sides_polygon + i];
            }
            drawBoundary_p();
        }
    }

    //  缩放多边形
    function scalePolygon()
    {
        movingRezone.width = mousePos.x - centers[editIndex_p].x;
        movingRezone.height = mousePos.y - centers[editIndex_p].y;
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        beingControlled_p = new Polygon(centers[editIndex_p].x,  centers[editIndex_p].y,  radius,  sides_polygon,  0, strokeStyle, fillStyle);
        beingControlled_p.stroke_fill(context);
        polygons[editIndex_p] = beingControlled_p;
    }

    //  缩放多边形完毕
    function scalePolygonUp()
    {
        var points = beingControlled_p.getPoints();
        for(var i = 0; i < sides_polygon; i++)
        {
            controlPoints_p[editIndex_p*sides_polygon+i] = points[i];
        }
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
        var points = beingControlled_p.getPoints();
        for(var i = 0; i < sides_polygon; i++)
        {
            controlPoints_p[editIndex_p*sides_polygon+i] = points[i];
        }
        centers[editIndex_p].x = mousePos.x - draggingOffsetX;
        centers[editIndex_p].y = mousePos.y - draggingOffsetY;
    }


    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        if(editIndex_l != -1)
        {
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
        context.clearRect(0, 0, canvas.width, canvas.height);
        editIndex_l = -1;
        editIndex_r = -1;
        editIndex_p = -1;

        if(lines.length > 0)
        {
            lines.forEach( function(line){
                line.stroke(context);
            } );
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
            rects.forEach( function(rect){
                rect.stroke_fill(context);
            } );
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
            polygons.forEach( function(polygon){
                polygon.stroke_fill(context);
            } );
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
    }



    function windowToCanvas(x, y)
    {
        var box = canvas.getBoundingClientRect();
        return {x:x - box.left * (canvas.width / box.width),
            y:y - box.top * (canvas.height / box.height)};
    }


    btn_line.onclick = function(e)
    {
        lineEditing = true;
        rectEditing = false;
        polygonEditing = false;
    }

    btn_rect.onclick = function(e)
    {
        lineEditing = false;
        rectEditing = true;
        polygonEditing = false;
    }

    btn_polygon.onclick = function(e)
    {
        lineEditing = false;
        rectEditing = false;
        polygonEditing = true;
    }




}
