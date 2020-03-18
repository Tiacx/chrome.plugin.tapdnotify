// 注意：如果浏览器禁止弹出任何通知，将无法使用

function notifyMe(title, option={}, click_cb=null) {
    // 检查浏览器是否支持 Notification
    if (!("Notification" in window)) {
        alert("你的不支持 Notification!  T.T");
    }
    // 检查用户是否已经允许使用通知
    else if (Notification.permission === "granted") {
        // 创建 Notification
        var notification = new Notification(title, option);
        // autoClose(notification, 3);
    }
    // 重新发起请求，让用户同意使用通知
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            // 用户同意使用通知
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }

            if (permission === "granted") {
                // 创建 Notification
                var notification = new Notification(title, option);
                // autoClose(notification, 3);
            }
        });
    }

    if (click_cb) {
        notification.onclick = click_cb;
    }
}

function autoClose(notification, time) {
    setTimeout(function() {
        notification.close();
    }, time*1000);
}