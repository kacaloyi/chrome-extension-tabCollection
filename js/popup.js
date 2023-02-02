const addBtn = document.getElementById("addBtn");
const viewBtn = document.getElementById("viewBtn");
const addAll = document.getElementById("addAll");
let isAdding = false; // 防止多次重复添加
let isAddingAll = false;
//chrome.tabs.query({active: true, currentWindow: true}, function (tabs) 获取当前Tab在Tabs[0]中
//chrome.tabs.query({},function(tabs) 获取所有Tabs列表
/**每个 Tabs[]包含的数据
   *{
    "active": false,
    "audible": false,
    "autoDiscardable": true,
    "discarded": false,
    "favIconUrl": "https://cdn.shopifycdn.net/shopifycloud/web/assets/v1/favicon-default-6cbad9de243dbae308677d167ce099ba8d350efcdf371a09753bb371874ca118..ico",
    "groupId": -1,
    "height": 721,
    "highlighted": false,
    "id": 946930324,
    "incognito": false,
    "index": 0,
    "mutedInfo": {
        "muted": false
    },
    "pinned": false,
    "selected": false,
    "status": "complete",
    "title": "kacaloyi-1 · kacaloyi-1.myshopify.com · Shopify",
    "url": "https://kacaloyi-1.myshopify.com/admin/access_account",
    "width": 1536,
    "windowId": 946930323
}*/

/**
 * 检查标签页是否已经包含在tabs列表中。
 * @param {*} tabs 已经存储的标签页列表
 * @param {*} tab  待检验的标签
 * @returns 
 */
function IsAdding(tabs,tab){
  
  if(!tab){ //空的标签页
    console.log("空的标签页");
    return true ;
  }
  //不要添加list.html
  let listurl = chrome.runtime.getURL('list.html');
  if(listurl==tab.url){
    return true;
  }
   
  if (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].url === tab.url) {
        return true
      }
    }
    
  } 

  return false;
}

function reloadlist(){
  let listurl = chrome.runtime.getURL('list.html');
  chrome.tabs.query({url:listurl,currentWindow: true}, function (tab) {
    if(tab) chrome.tabs.reload(tab[0].id,function(){});
  })
}
/**
 * 如果已在列表中，则不展示添加按钮
  chrome.storage.sync.get("tabs", ({ tabs }) => {
    console.log("get tabs", tabs)
    if (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].url === tab.url) {
          addBtn.style.display = "none"
        }
      }
    }
  });
});
 **/

function SaveTab2Tablist(tabs,tab){
  if(!tabs) 
  {
    tabs = [...tab]
  }
  const tabList = [...tabs]

  tab.forEach(function(item,index)  {
    if(false == IsAdding(tabs,item)){
      
        tabList.unshift({
          url: item.url,
          title: item.title,
          favIconUrl: item.favIconUrl
        })
      
      
    }    
  });

  chrome.storage.sync.set({ "tabs": tabList });
}

addBtn.addEventListener("click", async () => {
  console.log("click add ");

  isAdding = true
  chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
    console.log("query tab " + tab);
    chrome.storage.sync.get("tabs", ({ tabs }) => {
      console.log("get tabs", tabs)
      SaveTab2Tablist(tabs,tab);
      reloadlist();
      addBtn.innerText = "已添加√"
      isAdding = false
      setTimeout(() => {
        addBtn.innerText = "加入Tab清单"
      }, 1500)
    });
  });
});

viewBtn.addEventListener("click", async () => {
  let url = chrome.runtime.getURL('list.html');
  console.log("click list :"+url);
  window.open(url);
});

addAll.addEventListener("click", async () => {
  console.log("click add All");
 
  isAddingAll = true;
  chrome.tabs.query({}, function (tab) {
    console.log("query tab " + tab);
    chrome.storage.sync.get("tabs", ({ tabs }) => {
      console.log("get tabs", tabs)
      SaveTab2Tablist(tabs,tab);
      reloadlist();
    
      isAddingAll = false;
      addAll.innerText = "添加成功√"
      setTimeout(() => {
        addAll.innerText = "加入所有打开tab"
      }, 5000)

 
  });
 });

});