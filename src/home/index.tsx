import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import JSON5 from 'json5';
import ReactDOM from 'react-dom';
import styles1 from './style.less';

declare const window: Window & { chrome: any; CodeMirror: any };

const rule = [
    {
        from: '(.*)://www.baidu.com',
        to: '$1://www.baidu.com'
    }
];

const polyfill = (rules) => {
    if (rules && rules.proxy && Array.isArray(rules.proxy)) {
        const proxy = [];
        rules.proxy.forEach(rule => {
            if (rule && rule[0] && rule[1]) {
                proxy.push({
                    form: rule[0],
                    to: rule[1]
                })
            }
        })
        return proxy;
    }
    return rules;
}

const Pages = ({ isOptions, styles = styles1 }: any) => {

    const cachesRef = useRef({
        rules: [],
        index: 0,
    });

    const [reload, setReload] = useState(1);

    const [message, setMessage] = useState('');

    const htmlRef = useRef();

    useEffect(() => {
        window.chrome?.storage?.local.get(['XSwitchRedirectRulesConfig'], function (result) {
            const XSwitchRedirectRulesConfig = result.XSwitchRedirectRulesConfig || {};
            cachesRef.current = {
                isOpen: !!XSwitchRedirectRulesConfig?.isOpen,
                rules: XSwitchRedirectRulesConfig.rules || [
                    {
                        name: '新规则',
                        value: rule,
                        content: JSON5.stringify(rule, null, 2)
                    }
                ],
                index: XSwitchRedirectRulesConfig.index || 0,
            }
            setReload(Date.now());
            console.log('初始化：', cachesRef.current);
            initCodeMirror({ setMessage, save });
        });
    }, [])

    const initCodeMirror = ({ setMessage, save }) => {
        htmlRef.current.innerHTML = '';
        const value = cachesRef.current.rules?.[cachesRef.current.index]?.content;
        setMessage('');
        window.CodeMirror(htmlRef.current, {
            value: value || '',
            lineWrapping: false,
            lineNumbers: false,
            mode: "javascript",
            showCursorWhenSelecting: true,
            tabSize: 4,
            extraKeys: {
                "Ctrl-/": function (cm) {
                    toggleJsonComment(cm);
                },
                "Cmd-/": function (cm) {
                    toggleJsonComment(cm);
                },
            }
        }).on('change', (target) => {
            try {
                cachesRef.current.rules[cachesRef.current.index].value = polyfill(JSON5.parse(target.getValue()));
                cachesRef.current.rules[cachesRef.current.index].content = target.getValue();
                save(cachesRef.current);
                setMessage('');
            } catch (error) {
                setMessage(error.message);
                console.log(error);
            }
        })

        // 自定义的 JSON 注释切换函数
        function toggleJsonComment(cm) {
            var from = cm.getCursor("from");
            var to = cm.getCursor("to");

            cm.eachLine(from.line, to.line + 1, function (line) {
                var text = line.text;
                var lineNo = cm.getLineNumber(line);

                if (text.trim().startsWith('//')) {
                    // 如果行已经被注释，取消注释
                    cm.replaceRange(text.replace('//', '  '),
                        { line: lineNo, ch: 0 },
                        { line: lineNo, ch: text.length });
                } else {
                    // 如果行未被注释，添加注释
                    cm.replaceRange('// ' + text,
                        { line: lineNo, ch: 0 },
                        { line: lineNo, ch: text.length });
                }
            });
        }
    }

    const save = (XSwitchRedirectRulesConfig) => {
        window.chrome?.storage?.local.set({ XSwitchRedirectRulesConfig }, function () {
            window.chrome?.runtime.sendMessage({ action: 'updateRules', rules: cachesRef.current.rules, isOpen: cachesRef.current.isOpen });
        });
    }

    useEffect(() => {
        const stop = (event) => {
            if (event.keyCode === 83 && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
            }
        }

        window.addEventListener('keydown', stop);
        return () => {
            window.removeEventListener('keydown', stop);
        }
    }, [])

    return <div className={classNames(styles.s_switch, { [styles.s_options]: isOptions })}>
        <div className={styles.header}>
            <label className={styles.switch} key={reload}><input
                type="checkbox"
                defaultChecked={cachesRef.current.isOpen}
                onChange={(event) => {
                    cachesRef.current.isOpen = event.target.checked;
                    save(cachesRef.current);
                }}
            />开启</label>
            {
                isOptions ? null : <span
                    className={styles.fullscreen}
                    onClick={() => {
                        window.chrome.runtime.openOptionsPage();
                    }}
                >全屏</span>
            }
            <span
                className={styles.fullscreen}
                onClick={() => {
                    // 创建 JSON 文件
                    const jsonContent = JSON.stringify(cachesRef.current, null, 2);
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    // 创建下载链接
                    const url = URL.createObjectURL(blob);
                    // 触发下载
                    window.chrome.downloads.download({
                        url: url,
                        filename: `xwitch_export_${new Date().toISOString().replace(/:/g, '-')}.json`,
                        saveAs: true
                    });
                }}
            >导出</span>
            {
                isOptions ? <span
                    className={styles.fullscreen}
                    onClick={() => {
                        window.showOpenFilePicker({
                            types: [
                                {
                                    description: 'JSON Files',
                                    accept: {
                                        'application/json': ['.json']
                                    }
                                }
                            ],
                            multiple: false
                        }).then(async ([fileHandle]) => {
                            try {
                                // 获取文件
                                const file = await fileHandle.getFile();
                                // 读取文件内容
                                const fileContent = await file.text();
                                cachesRef.current = JSON.parse(fileContent);
                                htmlRef.current.innerHTML = '';
                                setReload(Date.now());
                                save(cachesRef.current);
                            } catch (error) {

                            }
                        })
                    }}
                >导入</span> : null
            }
            <span className={styles.error}>{message}</span>

        </div>
        <div className={styles.web_container}>
            <nav className={styles.nav}>
                <div className={styles.nav_list}>
                    {
                        cachesRef.current.rules?.map((item, idx) => <div
                            key={idx + reload}
                            className={classNames(styles.nav_item, { [styles.nav_active]: idx === cachesRef.current.index })}
                            title={item.name}
                        >
                            <input
                                defaultChecked={item.checked}
                                className={styles.checkbox}
                                type="checkbox"
                                onChange={(event) => {
                                    item.checked = event.target.checked;
                                    save(cachesRef.current);
                                }}
                            />
                            {
                                item.edit ? <input
                                    className={styles.input}
                                    onChange={(event) => {
                                        item.name = event.target?.value?.trim?.();
                                    }}
                                    defaultValue={item.name}
                                /> : <div className={styles.label}
                                    onClick={() => {
                                        // item.checked = !item.checked;
                                        cachesRef.current.index = idx;
                                        setReload(Date.now());
                                        initCodeMirror({ setMessage, save });
                                    }}
                                >{item.name}</div>
                            }
                            <div
                                className={styles.modify}
                                onClick={(event) => {
                                    item.edit = !item.edit;
                                    setReload(Date.now());
                                    event.preventDefault();
                                    save(cachesRef.current);
                                }}
                            >{item.edit ? '妥' : '改'}</div>
                            <div
                                className={styles.delete}
                                onClick={() => {
                                    if (confirm('确认删除?')) {
                                        cachesRef.current.rules.splice(idx, 1);
                                        cachesRef.current.index = 0;
                                        htmlRef.current.innerHTML = '';
                                        setReload(Date.now());
                                        save(cachesRef.current);
                                        // initCodeMirror({ setMessage, save });
                                    }
                                }}
                            >删</div>
                        </div>)
                    }
                </div>
                <div
                    className={classNames(styles.nav_item, styles.nav_item_new)}
                    onClick={() => {
                        cachesRef.current.rules.unshift({
                            name: '新规则',
                            value: rule,
                            content: JSON5.stringify(rule, null, 2),
                        })
                        cachesRef.current.index = 0;
                        setReload(Date.now());
                        initCodeMirror({ setMessage, save });
                        save(cachesRef.current);
                    }}
                >+</div>
            </nav>
            <div className={styles.container}>
                <div className={styles.content} ref={htmlRef}></div>
            </div>
        </div>
    </div>
}

export default Pages;

ReactDOM.render(<Pages />, document.getElementById('App'));
