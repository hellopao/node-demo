说明：
    用以前在邮箱中做的涂鸦邮件项目结合WebSocket做的一个多人实时涂鸦demo。
    邮箱项目中用了backbone.js.懒得全部去改就直接拿过来小改了下。代码写的比较挫。


原理：
    1.canvas面板上每画完一笔，调用canvas的toDataURL（）方法将当前所画内容保存为一张base64的图片。
    2.将图片消息发送到服务器。
    3.服务器接收到消息后将图片消息广播出去。（socket.broadcast.emit()）。
    4.客户端接收到消息图片消息后，调用canvas的drawImage()方法将图片画在canvas面板。
    
缺点：每次画完一笔，保存的base64图片会越来越大，发送的消息也越来越大。这种方案不好。

运行方法：
    
    在根用node目录运行app.js，打开任意两款支持html5 canvas特性的浏览器，地址栏中输入  http://localhost:3000/html/index.html. 
    在其中一个浏览器上涂鸦，在另一个浏览器上就可以看到画的内容。
    
