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
        $,
        $s = [],
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        sides = _$_,
        strokeStyle = 'black',
        fillStyle = 'green',
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if($s.length == 0)
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
                beingControlled = $s[editIndex_c];
            }
            else
            {
                checkMouseInPath();                                      //   检测鼠标是否点路径
                if(editIndex_c != -1)
                {
                    dragging = true;
                    beingControlled = $s[editIndex_c];
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
            draw$();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            $s.forEach( function($){
                $.stroke_fill(context);
            } )
            if(scaling)
            {
                scale$();
            }
            else
            {
                drag$();
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
                draw$Up();
            }
            else if(scaling)
            {
                scale$Up();
            }
            else if(dragging)
            {
                drag$Up();
            }
        }
        drawing = false;
        scaling = false;
        dragging = false;
    }

    function drawBoundary()
    {
        beingControlled.drawRubberbandRect(context, beingControlled.x,  beingControlled.y,  beingControlled.width,  beingControlled.height);
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


    //  画$
    function draw$()
    {
        updateBoundary();
        $ = new ??(mousedown.x,  mousedown.y,  movingRezone.width,  movingRezone.height, strokeStyle, fillStyle);
        $.stroke_fill(context);
    }

    //  画$完毕
    function draw$Up()
    {
        draw$();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            $s.push($);
            controlPoints.push({x:mousedown.x,  y:mousedown.y});
            controlPoints.push({x:_.x,  y:_.y});
            controlPoints.push({x:_.x,  y:_.y});
            controlPoints.push({x:_.x,  y:_.y});
            beingControlled = $;
            editIndex_c = $s.length - 1;
            drawBoundary();
        }
    }

    //  缩放$
    function scale$()
    {
        var width, height;
        if(downPointIndex == 0)
        {
            beingControlled.x = mousePos.x;
            beingControlled.y = mousePos.y;
            width = _;
            height = _;
        }
        else if(downPointIndex == 1)
        {
            beingControlled.x = _;
            beingControlled.y = _;
            width = _;
            height = _;
        }
        else if(downPointIndex == 2)
        {
            beingControlled.x = _;
            beingControlled.y = _;
            width = _;
            height = _;
        }
        else
        {
            beingControlled.x = _;
            beingControlled.y = _;
            width = _;
            height = _;
        }
        beingControlled.width = width;
        beingControlled.height = height;
    }

    //  缩放$完毕
    function scale$Up()
    {
        if(downPointIndex == 0)
        {
            controlPoints[editIndex_c*sides].x = mousePos.x;
            controlPoints[editIndex_c*sides].y = mousePos.y;
            controlPoints[editIndex_c*sides+1].y = _;
            controlPoints[editIndex_c*sides+3].x = _;
        }
        else if(downPointIndex == 1)
        {
            controlPoints[editIndex_c*sides].y = _;
            controlPoints[editIndex_c*sides+1].x = mousePos.x;
            controlPoints[editIndex_c*sides+1].y = mousePos.y;
            controlPoints[editIndex_c*sides+2].x = _;
        }
        else if(downPointIndex == 2)
        {
            controlPoints[editIndex_c*sides+1].x = _;
            controlPoints[editIndex_c*sides+2].x = mousePos.x;
            controlPoints[editIndex_c*sides+2].y = mousePos.y;
            controlPoints[editIndex_c*sides+3].y = _;
        }
        else if(downPointIndex == 3)
        {
            controlPoints[editIndex_c*sides].x = _;
            controlPoints[editIndex_c*sides+2].y = _;
            controlPoints[editIndex_c*sides+3].x = mousePos.x;
            controlPoints[editIndex_c*sides+3].y = mousePos.y;
        }
    }

    //  拖动$
    function drag$()
    {
        beingControlled.x = mousePos.x - draggingOffsetX;
        beingControlled.y = mousePos.y - draggingOffsetY;
    }

    //  拖动$完毕
    function drag$Up()
    {
        controlPoints[editIndex_c*sides].x = beingControlled.x;
        controlPoints[editIndex_c*sides].y = beingControlled.y;
        controlPoints[editIndex_c*sides+1].x = _;
        controlPoints[editIndex_c*sides+1].y = _;
        controlPoints[editIndex_c*sides+2].x = _;
        controlPoints[editIndex_c*sides+2].y = _;
        controlPoints[editIndex_c*sides+3].x = _;
        controlPoints[editIndex_c*sides+3].y = _;
    }


    //   检测鼠标是否点击控制点
    function checkMouseInControl()
    {
        for(var n = 0; n < sides; n++)
        {
            readyToDragPoints[n] = controlPoints[controlPoints.length - sides + n];
        }
        for(var i = 0;  i < sides;  i++)
        {
            drawPointPath(readyToDragPoints[i].x, readyToDragPoints[i].y);
            if( context.isPointInPath(mousePos.x, mousePos.y) )
            {
                //console.log(i);
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
        $s.forEach( function($){
            $.stroke_fill(context);
        } );
        for(var i = $s.length-1;  i >= 0;  i--) {
            $s[i].createPath(context);
            if (context.isPointInPath(mousePos.x, mousePos.y))
            {
                editIndex_c = i;
                return;
            }
            else
                editIndex_c = -1;
        }
    }


    function windowToCanvas(x, y)
    {
        var box = canvas.getBoundingClientRect();
        return {x:x - box.left * (canvas.width / box.width),
                 y:y - box.top * (canvas.height / box.height)};
    }


}