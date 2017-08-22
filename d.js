if(editIndex_l != -1 || editIndex_r != -1 || editIndex_p != -1)


    if(lineEditing)
    {
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
    }

if(rectEditing)
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

if(polygonEditing)
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







if(lineEditing)
{
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
            scaleLine();
        else
            dragLine();
        drawBoundary_l();
    }
}

if(rectEditing)
{
    if(drawing)
    {
        context.putImageData(imageData, 0, 0);
        drawRect();
    }
    else if(scaling || dragging)
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        rects.forEach( function(rect){
            rect.stroke_fill(context);
        } )
        if(scaling)
            scaleRect();
        else
            dragRect();
        drawBoundary_r();
    }
}

if(polygonEditing)
{
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
                if(polygon != beingControlled_p)
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
        drawBoundary_p();
    }
}