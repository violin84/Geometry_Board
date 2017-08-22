/**
 * Created by Administrator on 2017/01/07 ~ 01/08.
 */

function init()
{
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        imageData = {},
        drawing = false,
        scaling = false,
        dragging = false,
        editIndex,
        rect,
        rects = [],
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        sides = 4,
        strokeStyle = 'black', 
        fillStyle = 'green',
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(rects.length == 0)
        {
            drawing = true;
            readyTo();
        }
        else
        {
            checkMouseInControl();                                      //   检测鼠标是否点击控制点
            if(downPointIndex != -1)
            {
                scaling = true;
                beingControlled = rects[editIndex];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                if(editIndex != -1)
                {
                    dragging = true;
                    beingControlled = rects[editIndex];
                    draggingOffsetX = mousePos.x - beingControlled.x;
                    draggingOffsetY = mousePos.y - beingControlled.y;
                    for(var i = 0; i < sides; i++)
                    {
                        readyToDragPoints[i] = controlPoints[editIndex*sides+i];
                    }
                    drawBoundary();
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
            drawRect();
            drawBoundary();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            rects.forEach( function(rect){
                rect.stroke_fill(context);
            } )
            if(scaling)
            {
                scaleRect();
            }
            else
            {
                dragRect();
            }
            drawBoundary();
        }
    }


    canvas.onmouseup = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(mousePos.x != mousedown.x || mousePos.y != mousedown.y)
        {
            if(drawing)
            {
                context.putImageData(imageData, 0, 0);
                drawRectUp();
            }
            else if(scaling)
            {
                scaleRectUp();
            }
            else if(dragging)
            {
                dragRectUp();
            }
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

    function drawBoundary()
    {
        beingControlled.drawRubberbandRect(context, beingControlled.x,  beingControlled.y,  beingControlled.width,  beingControlled.height);
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
            controlPoints.push({x:mousedown.x,  y:mousedown.y});
            controlPoints.push({x:mousePos.x,  y:mousedown.y});
            controlPoints.push({x:mousePos.x,  y:mousePos.y});
            controlPoints.push({x:mousedown.x,  y:mousePos.y});
            for(var i = 0; i < sides; i++)
            {
                readyToDragPoints[i] = controlPoints[controlPoints.length - sides + i];
            }
            beingControlled = rect;
            editIndex = rects.length - 1;
            drawBoundary();
        }
    }

    //  缩放矩形
    function scaleRect()
    {
        var width, height;
        if(downPointIndex == 0)
        {
            beingControlled.x = mousePos.x;
            beingControlled.y = mousePos.y;
            width = readyToDragPoints[2].x - mousePos.x;
            height = readyToDragPoints[2].y - mousePos.y;
        }
        else if(downPointIndex == 1)
        {
            beingControlled.x = readyToDragPoints[0].x;
            beingControlled.y = mousePos.y;
            width = mousePos.x - readyToDragPoints[3].x;
            height = readyToDragPoints[3].y - mousePos.y;
        }
        else if(downPointIndex == 2)
        {
            beingControlled.x = readyToDragPoints[0].x;
            beingControlled.y = readyToDragPoints[0].y;
            width = mousePos.x - readyToDragPoints[0].x;
            height = mousePos.y - readyToDragPoints[0].y;
        }
        else
        {
            beingControlled.x = readyToDragPoints[1].x;
            beingControlled.y = readyToDragPoints[1].y;
            width = mousePos.x - readyToDragPoints[1].x;
            height = mousePos.y - readyToDragPoints[1].y;
        }
        beingControlled.width = width;
        beingControlled.height = height;
    }

    //  缩放矩形完毕
    function scaleRectUp()
    {
        if(downPointIndex == 0)
        {
            controlPoints[editIndex*sides].x = mousePos.x;
            controlPoints[editIndex*sides].y = mousePos.y;
            controlPoints[editIndex*sides+1].y = mousePos.y;
            controlPoints[editIndex*sides+3].x = mousePos.x;
        }
        else if(downPointIndex == 1)
        {
            controlPoints[editIndex*sides].y = mousePos.y;
            controlPoints[editIndex*sides+1].x = mousePos.x;
            controlPoints[editIndex*sides+1].y = mousePos.y;
            controlPoints[editIndex*sides+2].x = mousePos.x;
        }
        else if(downPointIndex == 2)
        {
            controlPoints[editIndex*sides+1].x = mousePos.x;
            controlPoints[editIndex*sides+2].x = mousePos.x;
            controlPoints[editIndex*sides+2].y = mousePos.y;
            controlPoints[editIndex*sides+3].y = mousePos.y;
        }
        else if(downPointIndex == 3)
        {
            controlPoints[editIndex*sides].x = mousePos.x;
            controlPoints[editIndex*sides+2].y = mousePos.y;
            controlPoints[editIndex*sides+3].x = mousePos.x;
            controlPoints[editIndex*sides+3].y = mousePos.y;
        }
    }

    //  拖动矩形
    function dragRect()
    {
        beingControlled.x = mousePos.x - draggingOffsetX;
        beingControlled.y = mousePos.y - draggingOffsetY;
    }

    //  拖动矩形完毕
    function dragRectUp()
    {
        controlPoints[editIndex*sides].x = beingControlled.x;
        controlPoints[editIndex*sides].y = beingControlled.y;
        controlPoints[editIndex*sides+1].x = beingControlled.x + beingControlled.width;
        controlPoints[editIndex*sides+1].y = beingControlled.y;
        controlPoints[editIndex*sides+2].x = beingControlled.x + beingControlled.width;
        controlPoints[editIndex*sides+2].y = beingControlled.y + beingControlled.height;
        controlPoints[editIndex*sides+3].x = beingControlled.x;
        controlPoints[editIndex*sides+3].y = beingControlled.y + beingControlled.height;
    }


    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        for(var i = 0;  i < sides;  i++)
        {
            drawPointPath(readyToDragPoints[i].x, readyToDragPoints[i].y);
            if( context.isPointInPath(mousePos.x, mousePos.y) )
            {
                console.log(i);
                downPointIndex = i;
                return;
            }
            else
                downPointIndex = -1;
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
        rects.forEach( function(rect){
            rect.stroke_fill(context);
        } );
        for(var i = rects.length-1;  i >= 0;  i--) {
            rects[i].createPath(context);
            if (context.isPointInPath(mousePos.x, mousePos.y))
            {
                editIndex = i;
                return;
            }
            else
                editIndex = -1;
        }
    }


    function windowToCanvas(x, y)
    {
        var box = canvas.getBoundingClientRect();
        return {x:x - box.left * (canvas.width / box.width),
                 y:y - box.top * (canvas.height / box.height)};
    }


}