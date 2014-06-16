
var MainModel = Backbone.Model.extend({
    defaults:{
    
    },

    canvasProperty: {
        "lineWidth" : "10",
        "strokeStyle" : "#000",
        "lineJoin" : "round",
        "lineCap" : "round"
    },

    getElementCoords: function(el) {
        if (!el) return null;
        var box = el.getBoundingClientRect(), 
            doc = el.ownerDocument, 
            body = doc.body, 
            html = doc.documentElement, 
            clientTop = html.clientTop || body.clientTop || 0, 
            clientLeft = html.clientLeft || body.clientLeft || 0, 
            top  = box.top  + (self.pageYOffset || html.scrollTop  ||  body.scrollTop ) - clientTop, 
            left = box.left + (self.pageXOffset || html.scrollLeft ||  body.scrollLeft) - clientLeft; 
        return { 'top': top, 'left': left, 'height': el.clientHeight,  'width': el.clientWidth };  
    },

    getElementStyle: function(el,style,isNeedUnit) {
        var styleValue = /(\d+(\.\d+)*)?[a-z%]*/ig;
        if (el.currentStyle) {
            return isNeedUnit ? parseFloat(el.currentStyle[style].replace(styleValue, "$1").replace("", "0")) : el.currentStyle[style];
        } else {
            return isNeedUnit ? parseFloat(window.getComputedStyle(el, null).getPropertyValue(style).replace(styleValue, "$1").replace("", "0")) : window.getComputedStyle(el, null).getPropertyValue(style);
        }
    }
});

var MainView = Backbone.View.extend({

    el: ".bigPop",

    events: {
        //"click #cancelOnClick" : "cancelOnClick",
        "click #redo" : "redo",
        "click #undo" : "undo",
        "click #clear" : "clear",
        //"click #complete" : "complete",
        //"click #rename" : "showNameInput",
        "click .colorCol span" : "changeStrokeStyle",
        "click .penCol a" : "changeLineWidth",
        //"click #eraser" : "changeStrokeStyle",
        "mousedown #canvas" : "touchstart",
        "mousemove #canvas" : "touchmove",
        "mouseup #canvas" : "touchend",
        "mouseout #canvas" : "mouseout",
        "touchstart #canvas" : "touchstart",
        "touchmove #canvas" : "touchmove",
        "touchend #canvas" : "touchend"
    },

    eventCoords: {},

    onPaintFlag: false,

    initialize : function() {
        this.model = new MainModel();
        this.initCanvas();
        return this;
    },

    initCanvas: function() {
        this.canvas = this.$el.find('#canvas')[0];
        this.context = this.canvas.getContext('2d');

        this.canvasCoords = this.model.getElementCoords(this.canvas);
        this.initCanvasProperty();
    },

    initCanvasProperty: function() {
        var This = this;
        var canvasPropertyMap = ['lineWidth','lineJoin','lineCap','strokeStyle'];
        _.each(canvasPropertyMap,function(item) {
            This.context[item] = This.model.canvasProperty[item];
        });
    },

    touchstart: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.onPaintFlag = true;
        this.eventCoords = {
            x : e.clientX - this.canvasCoords.left,
            y : e.clientY - this.canvasCoords.top
        };
        this.context.beginPath();
        this.context.moveTo(this.eventCoords.x,this.eventCoords.y);
    },

    touchmove: function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.onPaintFlag) {
            return;
        }
        this.eventCoords = {
            x : e.clientX - this.canvasCoords.left,
            y : e.clientY - this.canvasCoords.top
        };

        this.context.lineTo(this.eventCoords.x,this.eventCoords.y);
        this.context.stroke();
    },

    touchend: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.onPaintFlag = false;
        
        var imageData = this.getCurrentImageData();
        window.socketModel.trigger('data',imageData);
    },

    redo: function() {
        
    },

    undo: function() {
        
    },

    clear: function() {
        this.context.clearRect(0,0,this.canvasCoords.width,this.canvasCoords.height);
    },
    
    changeStrokeStyle: function(e) {
        var target = $(e.target);
        var currentColorContainer = target.parent();
        var color = this.model.getElementStyle(target[0],'background-color');
        this.context.strokeStyle = color;
        currentColorContainer.parent().find('.current').removeClass('current');
        currentColorContainer.addClass('current');
    },

    changeLineWidth: function(e) {
        var target = $(e.target);
        var fontSize = this.model.getElementStyle(target[0],'font-size');
        this.context.lineWidth = fontSize.replace(/[^\d]+$/,''); 
        target.parent().find('.current').removeClass('current');
        target.addClass('current');
    },
    
    getCurrentImageData: function() {
        var imageData = this.canvas.toDataURL();
        return imageData;
    },

    drawImge: function(imageData) {
        var This = this;
        var image = new Image();
        var width = this.canvasCoords.width;
        var height = this.canvasCoords.height;
        image.onload = function() {
            This.context.clearRect(0,0,width,height);  
            This.context.drawImage(image,0,0,width,height);
        };
        image.src = imageData;
    }

});

var SocketModel = Backbone.Model.extend({

    initialize: function(options) {
        this.socket = io.connect('http://localhost:3000');
        this.socket.on('message',this.handleMessage);
        return this;
    },

    handleMessage: function(message) {
        window.mainView.drawImge(message);
        console.log("hahahahahha___________:" + message);
    },

    sendMessage: function(message) {
        this.socket.send(message);
    }
});
$(function() {
    window.mainView = new MainView();
    window.socketModel = new SocketModel();
    socketModel.on('data',function(data) {
        socketModel.sendMessage(data);
    });
});
