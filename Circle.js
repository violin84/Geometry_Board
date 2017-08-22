/**
 * Created by Administrator on 2017/1/28.
 */

var Circle = function(x, y, radius, strokeStyle, fillStyle)
{
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.strokeStyle = strokeStyle;
    this.fillStyle = fillStyle;
}


Circle.prototype = {

    createPath: function(context)
    {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        context.closePath();
    },

    stroke: function(context)
    {
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    fill: function(context)
    {
        context.save();
        this.createPath(context);
        context.fillStyle = this.fillStyle;
        context.fill();
        context.restore();
    },

    stroke_fill: function(context)
    {
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        context.stroke();
        context.fill();
        context.restore();
    },

    //  ÐéÏßÏðÆ¤½î±ß¿ò
    drawRubberbandRect: function(context, x, y, radius)
    {
        context.save();
        context.setLineDash([4,2]);
        context.strokeStyle = 'gray';
        this.createPath(context);
        context.stroke();
        context.restore();
        this.drawControlPoints(context, x, y-radius);
        this.drawControlPoints(context, x+radius, y);
        this.drawControlPoints(context, x, y+radius);
        this.drawControlPoints(context, x-radius, y);
    },

    //  ¿ØÖÆµã
    drawControlPoints: function(context, x, y)
    {
        context.save();
        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI*2);
        context.stroke();
        context.fillStyle = 'gray';
        context.fill();
        context.restore();
    }
}