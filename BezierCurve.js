/**
 * Created by Administrator on 2017/1/29.
 */

var BezierCurve = function(endx, endy, controlx, controly, controlx2, controly2, endx2, endy2, strokeStyle, fillStyle)
{
    this.endx = endx;
    this.endy = endy;
    this.controlx = controlx;
    this.controly = controly;
    this.controlx2 = controlx2;
    this.controly2 = controly2;
    this.endx2 = endx2;
    this.endy2 = endy2;
    this.strokeStyle = strokeStyle;
    this.fillStyle = fillStyle;
}


BezierCurve.prototype = {

    createPath: function(context)
    {
        context.save();
        context.beginPath();
        context.moveTo(this.endx-5, this.endy+5);
        context.bezierCurveTo(this.controlx-5, this.controly+5, this.controlx2-5, this.controly2+5, this.endx2-5, this.endy2+5);
        context.lineTo(this.endx2+5, this.endy2-5);
        context.bezierCurveTo(this.controlx2+5, this.controly2-5, this.controlx+5, this.controly-5, this.endx+5, this.endy-5);
        context.closePath();
        context.restore();
    },

    stroke: function(context)
    {
        context.save();
        context.beginPath();
        context.moveTo(this.endx, this.endy);
        context.bezierCurveTo(this.controlx, this.controly, this.controlx2, this.controly2, this.endx2, this.endy2);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    stroke_fill: function(context)
    {
        this.stroke(context);
    },

    //  ÐéÏßÏðÆ¤½î±ß¿ò
    drawRubberbandRect: function(context, endx, endy, controlx, controly, controlx2, controly2, endx2, endy2)
    {
        context.save();
        context.setLineDash([4,2]);
        context.strokeStyle = 'gray';
        context.rect(endx, endy, endx2-endx, endy2-endy);
        context.stroke();
        context.restore();
        this.drawControlPoints(context, endx, endy);
        this.drawControlPoints(context, controlx, controly);
        this.drawControlPoints(context, controlx2, controly2);
        this.drawControlPoints(context, endx2, endy2);
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
