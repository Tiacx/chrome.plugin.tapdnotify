# chrome.plugin.tapdnotify
谷歌浏览器插件 - TAPD任务提醒

### 配置说明  

> 间隔设置

+ 轮询：查询全部任务的轮询间隔时间，单位秒，默认30秒 
+ 重复：重复提醒的时间，单位天，默认0（表示不重复）；允许小数，登录 0.5 天
*注：例如订阅了“转测试”的提醒。如果重复时间为0,则今天通知了，明天就不通知了；如果重复时间为了1，则今天通知了，明天还通知~*

> 消息订阅

+ 勾选您想订阅的任务状态，当关联的任务状态变更时，将会有桌面通知的形式提醒您
+ 自己修改自己的任务状态时，不提醒

### 接收不到通知？
> 1.允许网站通知

> 2.测试浏览器的通知功能
找开浏览器-》按f12打开控制台-》在console中输入以下代码-》回车执行
'''
new Notification('Hello World!', {
    body: '您好，世界！',
    icon: 'https://www.tapd.cn/favicon.ico'
});
'''

> 3.如果步骤2测试失败（没有效果），则查询电脑设置，查看是否已开户应用通知
方法：win+x+n 打开设置-》左上角搜索“通知”-》选择“启用或关闭应用通知”-》允许“获取来自应用和其他发送者的通知”

![通知设置](https://github.com/Tiacx/chrome.plugin.tapdnotify/blob/master/help.png)

### 赞赏
如果您觉得此插件还不错，能帮到你提高工作效率。可以打赏一下，金额不限。嗯。
![赞赏](https://github.com/Tiacx/chrome.plugin.tapdnotify/blob/master/alipay.png)
