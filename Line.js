/**
 * Created by Administrator on 2016/9/11.
 */


var Line = function(x, y, x2, y2, strokeStyle)
{
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.strokeStyle = strokeStyle;
}

Line.prototype = {

    createPath: function(context)
    {
        context.save();
        context.beginPath();
        var angle = Math.atan2( this.y2 - this.y , this.x2 - this.x );
        context.translate( this.x, this.y );
        context.rotate( angle );
        context.rect(0, -5, (this.x2 - this.x) / Math.cos(angle), 10 );
        context.closePath();
        context.restore();
    },

    stroke: function(context)
    {
        context.save();
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x2, this.y2);
        context.closePath();
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    stroke_fill: function(context)
    {
        context.save();
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x2, this.y2);
        context.closePath();
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    },

    //  ÐéÏßÏðÆ¤½î±ß¿ò
    drawRubberbandRect: function(context, x1, y1, x2, y2)
    {
        context.save();
        context.setLineDash([4,2]);
        context.strokeStyle = 'gray';
        context.strokeRect(x1, y1 , x2 - x1, y2 - y1);
        context.restore();
        this.drawControlPoints(context, x1, y1);
        this.drawControlPoints(context, x2, y2);
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
