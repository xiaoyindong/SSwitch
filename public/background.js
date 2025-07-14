// 初始化规则
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['XSwitchRedirectRulesConfig'], (result) => {
        const XSwitchRedirectRulesConfig = result.XSwitchRedirectRulesConfig || {};
        const rules = XSwitchRedirectRulesConfig.rules || [];
        const isOpen = XSwitchRedirectRulesConfig.isOpen || false;
        updateRules(rules, isOpen);
    });
});

// 辅助函数：获取下一个可用的规则 ID
let nextRuleId = 1;
function getNextRuleId() {
    return nextRuleId++;
}

// 更新规则的函数
function updateRules(rules, isOpen) {
    console.log('总开关状态：', isOpen)
    chrome.declarativeNetRequest.getDynamicRules(existingRules => {
        const newRules = [];
        console.log('传入的数据和存在的数据：', rules, existingRules);
        if (Array.isArray(rules) && isOpen) {
            rules.forEach((rule) => {
                if (rule.checked && rule.value && rule.value.length) {
                    rule.value.forEach(item => {
                        if (item.from && item.to) {
                            newRules.push({
                                id: getNextRuleId(),
                                // id: newRules.length + 1,
                                priority: 1,
                                action: {
                                    type: 'redirect',
                                    redirect: { regexSubstitution: item.to.replaceAll('$', '\\') },
                                },
                                condition: {
                                    regexFilter: item.from,
                                    resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
                                }
                            })
                        }
                    })
                }
            });
        }
        const removeRuleIds = [];
        if (existingRules && existingRules.length) {
            existingRules.forEach(item => {
                if (!removeRuleIds.includes(item.id)) {
                    removeRuleIds.push(item.id);
                }

            })
        }
        if (newRules && newRules.length) {
            newRules.forEach(item => {
                if (!removeRuleIds.includes(item.id)) {
                    removeRuleIds.push(item.id);
                }
            })
        }
        console.log('拦截的数据和刷新的id', newRules, removeRuleIds);
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: removeRuleIds,
            addRules: newRules
        }).then(() => {
            console.log("Rules updated successfully");
            return chrome.declarativeNetRequest.getDynamicRules();
        }).then((appliedRules) => {
            console.log("Applied rules:", appliedRules);
        }).catch((error) => {
            console.error("Error updating rules:", error);
        });
    });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updateRules") {
        console.log('传入的数据：',request);
        updateRules(request.rules, request.isOpen);
    }
});


// https://g.alicdn.com/prod-pur-group/yuncai-design/0.0.23/umd/caid.min.css