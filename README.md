manifest.json是整个插件的功能及文件配置清单，非常重要。
static目录是放置整个插件的静态资源文件的，包括css、js、图片等等资源
template目录是放置整个插件的功能页面模板的。
_locales目录是放置整个插件的国际化语言脚本的。

Browser Actions 在菜单栏上，在地址输入框旁边出现。
Page Actions 与 Browser Actions 的区别就是 Page Actions 并不是在每个页面上都是有用的，它必须在特定的页面中插件功能才能使用。
这两种用户面界面分别对应manifest.json中的browser_action和page_action字段。
manifest_version2和3有一些区别。3的action对应2的browser_action

弹出窗口pop 一般用于插件和用户的交互，而后台页面back一般用于插件本身做一些额外的事情。比如有时候，插件需要联网进行数据同步等操作，这种操作用户是无感知的，所有就要求插件需要有一个后台页面来运行这部分的逻辑。

其实后台页面还可以分为持久运行的后端页面和事件页面


manifest version 2和3的区别，看这篇文章。
https://blog.csdn.net/ZK645968/article/details/126288400 
迁移指南，看这个：
https://juejin.cn/post/7000363901221093412
这里写了一个例子，比较清晰一些。不单单讲解了迁移，还讲解了前后js和页面等三者之间如何通讯。
https://juejin.cn/post/7021072232461893639
这个讲的最基础，最清晰
http://www.huazhaox.com/article/1618

终于找到了开发文档的一部分 关于chrome.extension 替换成 chrome.runtime
https://blog.csdn.net/qq_35606400/article/details/123424124 

这篇文章，给出了通过runtime tabs extension的消息发送和接收方法，实现contente.js pop.js backscript.js 三者之间的通讯，
也介绍了作者了iFrame如何与js通讯的思路。
同时，写出了tabs和storage.local的操作方法。
https://blog.csdn.net/qq_41792345/article/details/121145131

没有了后台页面，不可运行远程代码，取消了很多函数

1.Service worker替换backgroud page/js
我们需要做的是把 script 数组的键改为 service_worker，替换多个background pages或scripts。所以，它应该是这样的:
{
	...,    "background": {    	"service_worker": "assets/js/background.js"
  	},
    ...
}

使用Service worker编写代码。只能注册事件侦听器，不能持续运行。 需要持续化的数据存入本地缓存，举个例子：

// 迁移方案
chrome.runtime.onMessage.addListener(({ type, name }) => {
  const count = await chrome.storage.local.get(['count']);
  if (type === "add-count") {
    count++;
    chrome.storage.local.set({'count': count})
  }
});
执行环境中是不可以使用localStorage.window变量的

2.使用新的declarativeNetRequest来修改请求  
在manifest V3中，要实现以上功能迁移方案为 declarativeNetRequest API。通过指定声明性规则来阻止或修改网络请求。这使扩展程序可以修改网络请求，而无需拦截它们并查看其内容，从而提供更多隐私。 

      首先需要在manifest中添加对应权限和指定静态规则集，

{
  "name": "My extension",
  ...
 
  "declarative_net_request" : {
    "rule_resources" : [
       {        
        "id": "ruleset_1",
        "enabled": true,
        "path": "rules_1.json"
       }
    ]
  },
  "permissions": [
    "declarativeNetRequest",  
    "declarativeNetRequestFeedback",
    ...
  ],
  ...

然后在目录下新建rules_1.json, 我们还是以修改Headers为例

[
  {
    "id": 1,
    "priority": 1,
    "condition": {
      "regexFilter": "https://XXX.XXX.XXX/api/*",
      "resourceTypes": [
        "xmlhttprequest"
      ]
    }, 
    "action": { 
      "type": "modifyHeaders",
      "requestHeaders": [
        {
          "header": "h1",
          "operation": "set",
          "value": "v4"
        },
        {
          "header": "foo",
          "operation": "remove"
        }
      ]
    }
  }
]
与webRequest API的比较：

​使用 declarativeNetRequest API 阻止或修改请求一般不需要主机declarativeNetRequest权限
因为请求不会被扩展进程拦截，所以 declarativeNetRequest 不需要扩展有后台页面，从而减少内存消耗。
​​​​​​ 在决定请求是被阻止还是重定向时，declarativeNetRequest API 的优先级高于 webRequest API，因为它允许同步拦截。
webRequest API 更灵活，因为允许以编程方式进行修改。
  API更多细节请见：declarativeNetRequest API
  https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/

如果有主机权限，需要将主机权限移动到host_permissions manifest.json 中的字段中。
"host_permissions": [ 
    "<all_urls>"
  ],


