function getTimeStamp() {
    return (new Date()).getTime();
}

function openWindow(url, width, height)
{
    var iWidth  = width || 1000; // 弹出窗口的宽度;
    var iHeight = height || 600; // 弹出窗口的高度;
    var iTop    = (window.screen.availHeight-30-iHeight)/2; // 获得窗口的垂直位置;
    var iLeft   = (window.screen.availWidth-10-iWidth)/2; // 获得窗口的水平位置;

    return window.open(url, "", "height="+iHeight+", width="+iWidth+", top="+iTop+", left="+iLeft);
}

function getTask(workspace_id, _cb) {
    var timestamp = getTimeStamp();
    var url = `https://www.tapd.cn/my_worktable/workspace_change/${workspace_id}?portlet_id=todo_all&type=todo&_=${timestamp}`;
    $.get(url, function(res){
        _cb(res);
    }, 'html');
}

function getStory(workspace_id, entityid, _cb) {
    var timestamp = getTimeStamp();
    var url = `https://www.tapd.cn/api/entity/entity_preview/story_preview_data?workspace_id=${workspace_id}&id=${entityid}&from=my_worktable&t=${timestamp}&inline_info=true`;
    $.get(url, function(res){
        _cb(res, entityid);
    }, 'json');
}

function getParent(story, _cb) {
    var timestamp = getTimeStamp();
    var url = `https://www.tapd.cn/${story.workspace_id}/prong/stories/view/${story.parent_id}`;
    $.get(url, function(res){
        _cb(res, story);
    }, 'html');
}

function getSubTasks(story, relateid, _cb) {
    var timestamp = getTimeStamp();
    var url = `https://www.tapd.cn/${story.workspace_id}/prong/stories/story_tree/${story.parent_id}?containerid=SubStories_div&time=${timestamp}`;
    $.get(url, function(res){
        _cb(res, relateid);
    }, 'html');
}

function setCache(key, val) {
    if (typeof(val) != 'string') val = JSON.stringify(val);
    localStorage.setItem(key, val);
}

function setConfig(params) {
    setCache('config', params.val);
}

function getCache(key, def_val, obj) {
    var pos = key.indexOf('.');
    if (pos > -1) {
        var k1 = key.substr(0, pos);
        var k2 = key.substr(pos+1);
        obj = obj? obj[k1]:localStorage.getItem(k1);
        if (typeof(obj) == 'string') obj = JSON.parse(obj);
        return getCache(k2, def_val, obj);
    } else {
        return (obj? obj[key]:localStorage.getItem(key)) || def_val;
    }
}

function getCacheObj(key, def_val) {
    var result = getCache(key, def_val);
    return typeof(result) == 'object'? result:JSON.parse(result);
}

function showMyTasks() {
    var mytasks = getCacheObj('mytasks', {});
    var items = '';
    for (var entityid in mytasks) {
        var item = mytasks[entityid];

        var sitems = '';
        for (var i in item.related) {
            var sitem = item.related[i];
            sitems += `<li class="list-group-item">
                <a href="${sitem.href}" target="parent">【${sitem.status}】 ${sitem.title}</a>
                <span class="badge">${sitem.owner}</span>
            </li>`;
        }

        items += `<li class="list-group-item collapse-wrapper">
            <a href="javascript:;" data-toggle="collapse" data-target="#collapse-${entityid}">【${item.status}】 ${item.title}</a>
            <span class="badge"><i class="glyphicon glyphicon-chevron-down"></i></span>
            <div id="collapse-${entityid}" class="collapse">
                <ul class="list-group">${sitems}</ul>
            </div>
        </li>`;
    }

    var content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TAPD任务提醒-MyTasks</title>
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
    <style type="text/css">
        .searchBar .keyword{width: 60%; margin: 10px auto;}
        .list-group{margin-bottom: 0}
        .list-group>.list-group-item>.collapse>.list-group{margin-top: 12px}
        .list-group>.list-group-item>.collapse>.list-group a{cursor: alias}
        .badge{cursor: pointer}
    </style>
</head>
<body>
    <div class="searchBar">
        <input type="text" class="form-control keyword" placeholder="Search...">
    </div>
    
    <ul class="list-group">${items}</ul>

    <script type="text/javascript">
        document.querySelectorAll('.collapse-wrapper>a').forEach(function(ele, i){
            ele.addEventListener('click', function(){
                if (this.parentNode.querySelector('.glyphicon').className.indexOf('glyphicon-chevron-down') > -1) {
                    this.parentNode.querySelector('.glyphicon').className = 'glyphicon glyphicon-chevron-up';
                    document.querySelector(this.getAttribute('data-target')).style.display = 'block';
                } else {
                    this.parentNode.querySelector('.glyphicon').className = 'glyphicon glyphicon-chevron-down';
                    document.querySelector(this.getAttribute('data-target')).style.display = 'none';
                }
            });
        });

        document.querySelector('.keyword').addEventListener('input', function(){
            var keyword = this.value;
            if (keyword == '') {
                document.querySelectorAll('.collapse-wrapper').forEach(function(ele, i){
                    ele.style.display = 'block';
                    ele.querySelector('.collapse').style.display = 'none';
                });
            } else {
                var reg = new RegExp(keyword, 'i');
                document.querySelectorAll('.collapse-wrapper').forEach(function(ele, i){
                    if (reg.test(ele.childNodes[1].text) == true) {
                        ele.style.display = 'block';
                    } else {
                        var isShow = false;
                        ele.querySelectorAll('.collapse .list-group-item a').forEach(function(oA, i){
                            if (reg.test(oA.innerText) == true) {
                                isShow = true;
                                return true;
                            }
                        });

                        if (isShow) {
                            ele.style.display = 'block';
                            ele.querySelector('.collapse').style.display = 'block';
                        } else {
                            ele.style.display = 'none';
                            ele.querySelector('.collapse').style.display = 'none';
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>`;

    var ow = openWindow('about:blank');
    ow.document.write(content);
}

function checkAndNotify(item, init) {
    var notify_history = getCacheObj('notify_history', {});
    var renotify_interval = getCache('config.renotify_interval', 0) * 86400;
    var now = getTimeStamp();
    var status = getCache('config.status.'+item.status, 0);
    if (item.relateid != undefined) {
        var mytasks = getCacheObj('mytasks', {});
        var cache_key = item.relateid;
        // 检查是否已经通知过了
        if (notify_history[cache_key] != undefined) {
            // 当前状态和父级状态不一样，且用户订阅了此状态
            if (item.status != mytasks[item.relateid].status && status > 0) {
                status = 1;
            }
        } else {
            status = 1;
        }
    } else {
        var cache_key = item.entityid;
    }
    var last_notifytime = notify_history[cache_key] || 0;

    if (init == true) {
        notify_history[cache_key] = now;
        setCache('notify_history', notify_history);
        return;
    }

    if (renotify_interval == 0 && notify_history[cache_key]) {
        return false;
    } else if (status == 1 && (now-last_notifytime) >= renotify_interval) {
        notifyMe('--' + item.status, {
            body: item.title,
            icon: 'https://www.tapd.cn/favicon.ico'
        }, ()=>{
            window.open(item.href);
        });

        notify_history[cache_key] = now;
        setCache('notify_history', notify_history);
    }
}

function checkTaskStatus(init=false) {
    if (location.href.indexOf('/view/') > -1) {
        return false;
    }

    $.get('https://www.tapd.cn/my_worktable/index/todo', function(worktable_html){
        var worktable = $(worktable_html);
        if (worktable.find('.j-worktable-project__item').length == 0) return false;

        var mytasks = {};
        worktable.find('.j-worktable-project__item').each(function(){
            var workspace_id = $(this).find('.j-item-link').attr('workspace_id');
            getTask(workspace_id, function(res){
                $(res).find('.tfl-editable').each(function(){
                    var item = {
                        'entityid': '',
                        'title': $(this).find('.preview-title').attr('title'),
                        'href': $(this).find('.preview-title').attr('href'),
                        'status': $(this).find('.j-item-status__change').attr('title'),
                        'owner': $('.avatar-text-default').attr('title'),
                        'related': []
                    }
                    var matches = item.href.match(/\d+/g);
                    item.entityid = matches[1];
                    mytasks[matches[1]] = item;
                    setCache('mytasks', mytasks);
                    checkAndNotify(item, init);
                    getStory(matches[0], matches[1], function(res, entityid){
                        if (!res) return false;
                        var parent_title = res.data.show_fields.parent_id.value.toLowerCase();
                        if (res.data.show_fields.parent_id && (parent_title.indexOf('java') > -1) || parent_title.indexOf('接口') > -1) {
                            getParent(res.data.story, function(res, story){
                                mytasks[story.id].related = [];
                                var oPage = $(res);
                                var sitem = {
                                    'relateid': story.id,
                                    'entityid': story.parent_id,
                                    'title': oPage.find('.story-title').attr('data-editable-value'),
                                    'href': `https://www.tapd.cn/${story.workspace_id}/prong/stories/view/${story.parent_id}`,
                                    'status': oPage.find('.status-field').attr('title'),
                                    'owner': oPage.find('#ContentStatusOwner').attr('data-editable-value')
                                }
                                mytasks[story.id].related.push(sitem);
                                setCache('mytasks', mytasks);
                                checkAndNotify(sitem, init);
                            });
                        } else if (res.data.story) {
                            getSubTasks(res.data.story, entityid, function(res, relateid){
                                mytasks[relateid].related = [];
                                $(res).find('.substory-tab-table tr:gt(1)').each(function(){
                                    var sitem = {
                                        'relateid': relateid,
                                        'entityid': $(this).attr('story_id'),
                                        'title': $(this).find('.cell-title').attr('title'),
                                        'href': $(this).find('.cell-title').attr('href'),
                                        'status': $(this).find('.j-item-status__change').attr('title'),
                                        'owner': $(this).find('.field-td-owner').attr('data-editable-value')
                                    }
                                    mytasks[relateid].related.push(sitem);
                                    setCache('mytasks', mytasks);
                                    checkAndNotify(sitem, init);
                                });
                            });
                        }
                    });
                });
            })
        });

        window.setTimeout(checkTaskStatus, getCache('config.ajax_interval', 60)*1000);

    }, 'html');
}

chrome.runtime.onMessage.addListener(function(mixed, sender, sendResponse) {
    if (typeof(mixed) == 'string') {
        window[mixed]();
    } else {
        window[mixed['method']](mixed['params']);
    }
});

window.setTimeout(function(){
    var init = getCache('notify_history', false)===false? true:false;
    checkTaskStatus(init);
}, 5000);
