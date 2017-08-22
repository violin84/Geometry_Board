/**
 * Created by Administrator on 2017/01/13.
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
        polygon,
        polygons = [],
        radius,
        centers = [],
        controlPoints = [],
        downPointIndex = -1,
        readyToDragPoints = [],
        beingControlled,
        mousedown = {},
        mousePos = {},
        movingRezone = {},
        draggingOffsetX,
        draggingOffsetY,
        sides = 5,
        strokeStyle = 'black',
        fillStyle = 'green',
        CONTROL_POINT_RADIUS = 5;

    canvas.onmousedown = function(e)
    {
        mousePos = windowToCanvas(e.clientX, e.clientY);
        e.preventDefault();
        if(polygons.length == 0)
        {
            drawing = true;
            readyTo();
        }
        else
        {
            checkMouseInControl();                                      //   �������Ƿ������Ƶ�
            if(downPointIndex != -1)
            {
                scaling = true;
                beingControlled = polygons[editIndex];
            }
            else
            {
                checkMouseInPath();                                      //   �������Ƿ��·��
                if(editIndex != -1)
                {
                    dragging = true;
                    beingControlled = polygons[editIndex];
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
            drawPolygon();
        }
        else if(scaling || dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if(scaling)
            {
                polygons.forEach( function(polygon){
                    if(polygon != beingControlled)
                        polygon.stroke_fill(context);
                } )
                scalePolygon();
            }
            else
            {
                polygons.forEach( function(polygon){
                    polygon.stroke_fill(context);
                } )
                dragPolygon();
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
                drawPolygonUp();
            }
            else if(scaling)
            {
                scalePolygonUp();
            }
            else if(dragging)
            {
                dragPolygonUp();
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


    function drawBoundary()
    {
        var points = beingControlled.getPoints();
        for(var i = 0; i < sides; i++)
        {
            readyToDragPoints[i] = points[i];
        }
        beingControlled.drawRubberbandRect(context, readyToDragPoints);
    }


    //  �������
    function drawPolygon()
    {
        updateBoundary();
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        polygon = new Polygon(mousedown.x,  mousedown.y,  radius,  sides,  0, strokeStyle, fillStyle);
        polygon.stroke_fill(context);
        beingControlled = polygon;
    }

    //  ����������
    function drawPolygonUp()
    {
        drawPolygon();
        if(movingRezone.width != 0 && movingRezone.height != 0)
        {
            polygons.push(polygon);
            beingControlled = polygon;
            editIndex = polygons.length - 1;
            var points = polygon.getPoints();
            for(var i = 0; i < sides; i++)
            {
                controlPoints.push({x:points[i].x,  y:points[i].y});
                readyToDragPoints[i] = controlPoints[editIndex * sides + i];
            }
            drawBoundary();
        }
    }

    //  ���Ŷ����
    function scalePolygon()
    {
        movingRezone.width = mousePos.x - centers[editIndex].x;
        movingRezone.height = mousePos.y - centers[editIndex].y;
        radius = Math.sqrt(movingRezone.width * movingRezone.width + movingRezone.height * movingRezone.height);
        beingControlled = new Polygon(centers[editIndex].x,  centers[editIndex].y,  radius,  sides,  0, strokeStyle, fillStyle);
        beingControlled.stroke_fill(context);
        polygons[editIndex] = beingControlled;
    }

    //  ���Ŷ�������
    function scalePolygonUp()
    {
        var points = beingControlled.getPoints();
        for(var i = 0; i < sides; i++)
        {
            controlPoints[editIndex*sides+i] = points[i];
        }
    }

    //  �϶������
    function dragPolygon()
    {
        beingControlled.x = mousePos.x - draggingOffsetX;
        beingControlled.y = mousePos.y - draggingOffsetY;
    }

    //  �϶���������
    function dragPolygonUp()
    {
        var points = beingControlled.getPoints();
        for(var i = 0; i < sides; i++)
        {
            controlPoints[editIndex*sides+i] = points[i];
        }
        centers[editIndex].x = mousePos.x - draggingOffsetX;
        centers[editIndex].y = mousePos.y - draggingOffsetY;
    }


    //   �������Ƿ������Ƶ�
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

    //  ���Ƶ�·��
    function drawPointPath(x, y)
    {
        context.beginPath();
        context.arc(x, y, CONTROL_POINT_RADIUS, 0, Math.PI*2);
    }


    //   �������Ƿ��·��
    function checkMouseInPath()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        polygons.forEach( function($){
            $.stroke_fill(context);
        } );
        for(var i = polygons.length-1;  i >= 0;  i--) {
            polygons[i].createPath(context);
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