function setCache(key, val) {
    if (typeof(val) != 'string') val = JSON.stringify(val);
    localStorage.setItem(key, val);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            'method': 'setConfig',
            'params': {'key':key, 'val':val}
        });
    });
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

document.querySelectorAll('.label-checkbox').forEach(function(ele, i){
    ele.addEventListener('click', function(){
        var config = getCacheObj('config', {'status':{}});
        var oI = this.childNodes[1];
        var val = oI.getAttribute('data-value');
        if (oI.className.indexOf('glyphicon-unchecked') > -1) {
            oI.className = 'glyphicon glyphicon-check';
            config.status[val] = 1;
        } else {
            oI.className = 'glyphicon glyphicon-unchecked';
            config.status[val] = 0;
        }
        setCache('config', config);
    });
});

document.querySelector('.btn-show-mytasks').addEventListener('click', function(){
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'showMyTasks');
    });
});

document.querySelector('.ajax-interval').addEventListener('blur', function(){
    var config = getCacheObj('config', {});
    var interval = parseInt(this.value) || 0;
    interval = interval>5? interval:60;
    config['ajax_interval'] = interval;
    setCache('config', config);
    this.value = interval;
});

document.querySelector('.renotify-interval').addEventListener('blur', function(){
    var config = getCacheObj('config', {});
    var interval = parseFloat(this.value) || 0;
    interval = interval>0? interval:0;
    config['renotify_interval'] = interval;
    setCache('config', config);
    this.value = interval;
});

function checkIsChecked() {
    document.querySelectorAll('.label-checkbox').forEach(function(ele, i){
        var oI = ele.childNodes[1];
        if (getCache('config.status.'+oI.getAttribute('data-value'), 0) == 1) {
            oI.className = 'glyphicon glyphicon-check';
        } else {
            oI.className = 'glyphicon glyphicon-unchecked';
        }
    });
}

function init() {
    document.querySelector('.ajax-interval').value = getCache('config.ajax_interval', 60);
    document.querySelector('.renotify-interval').value = getCache('config.renotify_interval', 0);

    checkIsChecked();
}

init();