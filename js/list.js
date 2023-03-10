const list = document.getElementById("list")
const openAllBtn = document.getElementById("openAllBtn")
const closeAllBtn = document.getElementById("closeAllBtn")
renderTabList()
function renderTabList() {
    chrome.storage.sync.get("tabs", ({ tabs }) => {
        console.log("tab list", tabs)
        list.innerHTML = ""
        if (tabs) {
            let htmlStr = ""
            for (let i = 0; i < tabs.length; i++) {
               
                htmlStr += "<div class=item>" +"<img src=\""+tabs[i].favIconUrl+"\"/>"  + "<a target='_blank' href='" + tabs[i].url + "'>" + (i + 1)+". "+ tabs[i].title + "</a><span class='delete-btn' id='delete_" + i + "'>删除</span></span></a></div>"
            }
            list.innerHTML = htmlStr
            for (let i = 0; i < tabs.length; i++) {
                const delBtn = document.getElementById("delete_" + i)
                if (delBtn) {
                    delBtn.addEventListener("click", function () {
                        tabs.splice(i, 1)
                        chrome.storage.sync.set({ "tabs": tabs });
                        renderTabList()
                    })
                }
            }
        }
    });
}

openAllBtn.addEventListener("click", function () {
    chrome.storage.sync.get("tabs", ({ tabs }) => {
        if (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                window.open(tabs[i].url);
            }
        }
    });
})

closeAllBtn.addEventListener("click", function () {
    const status = confirm("确定全部删除？");
    if (status === true) {
        chrome.storage.sync.set({ "tabs": [] });
        window.location.reload();
    }
    const ss = confirm("关闭这个标签页？");
    if(ss === true){
        chrome.tabs.query({active: true, currentWindow: true}, function (tab){
            chrome.tabs.remove(tab[0].id);
        });
    }
})