/**
 * Created by Administrator on 2017/01/14.
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
        line,
        lines = [],
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(lines.length == 0)
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
                beingControlled = lines[editIndex];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                if(editIndex != -1)
                {
                    dragging = true;
                    beingControlled = lines[editIndex];
                    draggingOffsetX = mousePos.x - beingControlled.x;
                    draggingOffsetY = mousePos.y - beingControlled.y;
                    readyToDragPoints[0] = controlPoints[editIndex*2];
                    readyToDragPoints[1] = controlPoints[editIndex*2+1];
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
            drawLine();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            lines.forEach( function(line){
                line.stroke(context);
            } )
            if(scaling)
            {
                scaleLine();
            }
            else
            {
                dragLine();
            }
            drawBoundary();
        }
    }

    canvas.onmouseup = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            drawLineUp();
        }
        else if(scaling)
        {
            scaleLineUp();
        }
        else if(dragging)
        {
            dragLineUp();
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
        beingControlled.drawRubberbandRect(context, beingControlled.x,  beingControlled.y,  beingControlled.x2,  beingControlled.y2);
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
        controlPoints.push({x:mousedown.x,  y:mousedown.y});
        controlPoints.push({x:mousePos.x,  y:mousePos.y});
        readyToDragPoints[0] = controlPoints[controlPoints.length - 2];
        readyToDragPoints[1] = controlPoints[controlPoints.length - 1];
        beingControlled = line;
        drawBoundary();
        editIndex = lines.length - 1;
    }

    //  缩放直线
    function scaleLine()
    {
         if(downPointIndex == 0)
         {
             beingControlled.x = mousePos.x;
             beingControlled.y = mousePos.y;
         }
         else
         {
             beingControlled.x2 = mousePos.x;
             beingControlled.y2 = mousePos.y;
         }
    }

    //  缩放直线完毕
    function scaleLineUp()
    {
        if(downPointIndex == 0)
        {
            controlPoints[editIndex*2].x = mousePos.x;
            controlPoints[editIndex*2].y = mousePos.y;
        }
        else
        {
            controlPoints[editIndex*2+1].x = mousePos.x;
            controlPoints[editIndex*2+1].y = mousePos.y;
        }
    }

    //  拖动直线
    function dragLine()
    {
        beingControlled.x = mousePos.x - draggingOffsetX;
        beingControlled.y = mousePos.y - draggingOffsetY;
        beingControlled.x2 = beingControlled.x + (readyToDragPoints[1].x - readyToDragPoints[0].x);
        beingControlled.y2 = beingControlled.y + (readyToDragPoints[1].y - readyToDragPoints[0].y);
    }

    //  拖动直线完毕
    function dragLineUp()
    {
        controlPoints[editIndex*2].x = beingControlled.x;
        controlPoints[editIndex*2].y = beingControlled.y;
        controlPoints[editIndex*2+1].x = beingControlled.x2;
        controlPoints[editIndex*2+1].y = beingControlled.y2;
    }

    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        for(var i = 0;  i < readyToDragPoints.length;  i++)
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
        lines.forEach( function(line){
            line.stroke(context);
        } );
        for(var i = lines.length-1;  i >= 0;  i--) {
            lines[i].createPath(context);
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