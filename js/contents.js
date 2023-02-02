/** 注入match指定的网站内运行。可以加按钮什么的。
chrome.runtime.sendMessage({ type: "checkFlag" }, (response) => {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {
            console.log("send message success!");

            setTimeout(function () {
                chrome.runtime.sendMessage({ type: "sendRequest" }, (response) => {
                    console.log("send sendRequest success");
                });
            }, 5000);
        }
    }
});

// 后台监听事件消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log(message);
    let requestType = message.type;

    switch (requestType) {
        // 检测是否是扩展开启状态
        case "checkTab":
            sendResponse({ "runtime": true });
            break;
    }
    return true;
});
**/