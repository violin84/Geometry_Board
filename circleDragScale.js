/**
 * Created by Administrator on 2017/01/29.
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
        circle,
        circles = [],
        radius,
        circleCPCount = 4,
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        strokeStyle = 'black',
        fillStyle = 'green',
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(circles.length == 0)
        {
            drawing = true;
            readyTo();
        }
        else
        {
            checkMouseInControl();                                      //   检测鼠标是否点击控制点
            console.log(downPointIndex);
            if(downPointIndex != -1)
            {
                scaling = true;
                beingControlled = circles[editIndex];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                if(editIndex != -1)
                {
                    dragging = true;
                    beingControlled = circles[editIndex];
                    draggingOffsetX = mousePos.x - beingControlled.x;
                    draggingOffsetY = mousePos.y - beingControlled.y;
                    drawBoundary();
                }
            }
            if(!scaling && !dragging)
            {
                drawing = true;
                readyTo();
            }
        }
        // console.log("readyScaling: " + readyScaling);
    }


    canvas.onmousemove = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            drawCircle();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            circles.forEach( function(circle){
                circle.stroke_fill(context);
            } )
            if(scaling)
            {
                scaleCircle();
            }
            else
            {
                dragCircle();
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
                drawCircleUp();
            }
            else if(scaling)
            {
                scaleCircleUp();
            }
            else if(dragging)
            {
                dragCircleUp();
            }
        }
        drawing = false;
        scaling = false;
        dragging = false;
    }

    function drawBoundary()
    {
        beingControlled.drawRubberbandRect(context, beingControlled.x,  beingControlled.y,  beingControlled.radius);
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


    //  画圆
    function drawCircle()
    {
        updateBoundary();
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        circle = new Circle(mousedown.x,  mousedown.y,  radius, strokeStyle, fillStyle);
        circle.stroke_fill(context);
    }

    //  画圆完毕
    function drawCircleUp()
    {
        drawCircle();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            circles.push(circle);
            controlPoints.push({x:mousedown.x,  y:mousedown.y-radius});
            controlPoints.push({x:mousedown.x+radius,  y:mousedown.y});
            controlPoints.push({x:mousedown.x,  y:mousedown.y+radius});
            controlPoints.push({x:mousedown.x-radius,  y:mousedown.y});
            beingControlled = circle;
            editIndex = circles.length - 1;
            drawBoundary();
        }
    }

    //  缩放圆
    function scaleCircle()
    {
        movingRezone.width = mousePos.x - beingControlled.x;
        movingRezone.height = mousePos.y - beingControlled.y;
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        beingControlled.radius = radius;
    }

    //  缩放圆完毕
    function scaleCircleUp()
    {
        setControPoint();
    }

    //  拖动圆
    function dragCircle()
    {
        beingControlled.x = mousePos.x - draggingOffsetX;
        beingControlled.y = mousePos.y - draggingOffsetY;
    }

    //  拖动圆完毕
    function dragCircleUp()
    {
        setControPoint();
    }

    function setControPoint()
    {
        controlPoints[editIndex*circleCPCount] = {x:beingControlled.x,  y:beingControlled.y-beingControlled.radius};
        controlPoints[editIndex*circleCPCount+1] = {x:beingControlled.x+beingControlled.radius,  y:beingControlled.y};
        controlPoints[editIndex*circleCPCount+2] = {x:beingControlled.x,  y:beingControlled.y+beingControlled.radius};
        controlPoints[editIndex*circleCPCount+3] = {x:beingControlled.x-beingControlled.radius,  y:beingControlled.y};
    }


    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        for(var n = 0; n < circleCPCount; n++)
        {
            readyToDragPoints[n] = controlPoints[editIndex*circleCPCount+n];
        }
        for(var i = 0;  i < circleCPCount;  i++)
        {
            drawPointPath(readyToDragPoints[i].x, readyToDragPoints[i].y);
            if( context.isPointInPath(mousePos.x, mousePos.y) )
            {
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
        circles.forEach( function(circle){
            circle.stroke_fill(context);
        } );
        for(var i = circles.length-1;  i >= 0;  i--) {
            circles[i].createPath(context);
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