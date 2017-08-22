/**
 * Created by Administrator on 2016/11/21.
 */

var Rectangle = function(x, y, width, height, strokeStyle, fillStyle){

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strokeStyle = strokeStyle;
    this.fillStyle = fillStyle;
}

Rectangle.prototype = {

    createPath: function(context){

        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.closePath();
    },

    stroke: function(context){

        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    fill:function(context){

        context.save();
        this.createPath(context);
        context.fillStyle = this.fillStyle;
        context.fill();
        context.restore();
    },

    stroke_fill: function(context){

        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        context.stroke();
        context.fill();
        context.restore();
    },

    stretch:function(context, x1, y1, x2, y2, x3, y3, x4, y4){

        context.save();
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.closePath();
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        context.stroke();
        context.fill();
        context.restore();
    },

    rotate:function(context, x1, y1, x2, y2, x3, y3, x4, y4){

        context.save();
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.closePath();
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        context.stroke();
        context.fill();
        context.restore();
    },


    //  ÐéÏßÏðÆ¤½î±ß¿ò
    drawRubberbandRect: function(context, x, y, width, height)
    {
        context.save();
        context.setLineDash([4,2]);
        context.strokeStyle = 'gray';
        context.strokeRect(x, y, width, height);
        context.restore();
        this.drawControlPoints(context, x, y);
        this.drawControlPoints(context, x+width, y);
        this.drawControlPoints(context, x+width, y+height);
        this.drawControlPoints(context, x, y+height);
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
