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
        bezierCurve,
        bezierCurve_width,
        bezierCurve_height,
        bezierCurves = [],
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        bezierCurveCPCount = 4,
        strokeStyle = 'black',
        fillStyle = 'green',
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(bezierCurves.length == 0)
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
                beingControlled = bezierCurves[editIndex];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                if(editIndex != -1)
                {
                    dragging = true;
                    beingControlled = bezierCurves[editIndex];
                    draggingOffsetX = mousePos.x - beingControlled.endx;
                    draggingOffsetY = mousePos.y - beingControlled.endy;
                    bezierCurve_width = beingControlled.endx2 - beingControlled.endx;
                    bezierCurve_height = beingControlled.endy2 - beingControlled.endy;
                    drawBoundary();
                }
            }
            if(!scaling && !dragging)
            {
                drawing = true;
                readyTo();
            }
        }
       // console.log("editIndex: " + editIndex);
    }


    canvas.onmousemove = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();

        if(drawing)
        {
            context.putImageData(imageData, 0, 0);
            drawBezierCurve();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            bezierCurves.forEach( function(BezierCurve){
                BezierCurve.stroke_fill(context);
            } )
            if(scaling)
            {
                scaleBezierCurve();
            }
            else
            {
                dragBezierCurve();
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
                drawBezierCurveUp();
            }
            else if(scaling)
            {
                scaleBezierCurveUp();
            }
            else if(dragging)
            {
                dragBezierCurveUp();
            }
        }
        drawing = false;
        scaling = false;
        dragging = false;
    }

    function drawBoundary()
    {
        beingControlled.drawRubberbandRect(context, beingControlled.endx,  beingControlled.endy,
                                                    beingControlled.controlx,  beingControlled.controly,
                                                    beingControlled.controlx2,  beingControlled.controly2,
                                                    beingControlled.endx2,  beingControlled.endy2);
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
            controlPoints.push({x:mousedown.x,  y:mousedown.y});
            controlPoints.push({x:mousedown.x,  y:mousedown.y + movingRezone.height});
            controlPoints.push({x:mousedown.x + movingRezone.width,  y:mousedown.y});
            controlPoints.push({x:mousedown.x + movingRezone.width,  y:mousedown.y + movingRezone.height});
            beingControlled = bezierCurve;
            editIndex = bezierCurves.length - 1;
            drawBoundary();
        }
    }

    //  缩放贝塞尔曲线
    function scaleBezierCurve()
    {
        if(downPointIndex == 0)
        {
            beingControlled.endx = mousePos.x;
            beingControlled.endy = mousePos.y;
            beingControlled.controlx = mousePos.x;
            beingControlled.controly2 = mousePos.y;
        }
        else if(downPointIndex == 1)
        {
            beingControlled.endx = mousePos.x;
            beingControlled.controlx = mousePos.x;
            beingControlled.controly = mousePos.y;
            beingControlled.endy2 = mousePos.y;
        }
        else if(downPointIndex == 2)
        {
            beingControlled.endy = mousePos.y;
            beingControlled.controlx2 = mousePos.x;
            beingControlled.controly2 = mousePos.y;
            beingControlled.endx2 = mousePos.x;
        }
        else
        {
            beingControlled.controly = mousePos.y;
            beingControlled.controlx2 = mousePos.x;
            beingControlled.endx2 = mousePos.x;
            beingControlled.endy2 = mousePos.y;
        }
    }

    //  缩放贝塞尔曲线完毕
    function scaleBezierCurveUp()
    {
        setControPoint();
    }

    //  拖动贝塞尔曲线
    function dragBezierCurve()
    {
        beingControlled.endx = mousePos.x - draggingOffsetX;
        beingControlled.endy = mousePos.y - draggingOffsetY;
        beingControlled.controlx = beingControlled.endx;
        beingControlled.controly = beingControlled.endy + bezierCurve_height;
        beingControlled.controlx2 = beingControlled.endx + bezierCurve_width;
        beingControlled.controly2 = beingControlled.endy;
        beingControlled.endx2 = beingControlled.controlx2;
        beingControlled.endy2 = beingControlled.controly;
    }

    //  拖动贝塞尔曲线完毕
    function dragBezierCurveUp()
    {
        setControPoint();
    }

    function setControPoint()
    {
        controlPoints[editIndex*bezierCurveCPCount].x = beingControlled.endx;
        controlPoints[editIndex*bezierCurveCPCount].y = beingControlled.endy;
        controlPoints[editIndex*bezierCurveCPCount+1].x = beingControlled.controlx;
        controlPoints[editIndex*bezierCurveCPCount+1].y = beingControlled.controly;
        controlPoints[editIndex*bezierCurveCPCount+2].x = beingControlled.controlx2;
        controlPoints[editIndex*bezierCurveCPCount+2].y = beingControlled.controly2;
        controlPoints[editIndex*bezierCurveCPCount+3].x = beingControlled.endx2;
        controlPoints[editIndex*bezierCurveCPCount+3].y = beingControlled.endy2;
    }


    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        for(var n = 0; n < bezierCurveCPCount; n++)
        {
            readyToDragPoints[n] = controlPoints[controlPoints.length - bezierCurveCPCount + n];
        }
        for(var i = 0;  i < bezierCurveCPCount;  i++)
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
        bezierCurves.forEach( function(bezierCurve){
            bezierCurve.stroke_fill(context);
        } );
        for(var i = bezierCurves.length-1;  i >= 0;  i--) {
            bezierCurves[i].createPath(context);
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