import React, { FC, useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from './style.less';

const Pages = () => {

    const [list, setList] = useState([{ name: '默认', value: JSON.stringify([['origin', 'target']], null, 2) }]);

    const [index, setIndex] = useState(0);

    return <div className={styles.s_switch}>
        <nav className={styles.nav}>
            {
                list.map((item, idx) => <div
                    key={idx}
                    className={classNames(styles.nav_item, { [styles.nav_active]: idx === index })}
                    title={item.name}
                    onClick={() => {
                        setIndex(idx);
                    }}
                >
                    {/* {
                        item.edit ? <input
                            autofocus
                            className={styles.input}
                            onChange={(event) => {
                                item.name = event.target?.value?.trim?.();
                            }}
                            onBlur={() => {
                                item.edit = false;
                                setList([...list]);
                            }}
                            defaultValue={item.name}
                        /> : <div
                            className={styles.label}
                            onClick={() => {
                                console.log(11111);
                            }}
                            onDoubleClick={(event) => {
                                item.edit = true;
                                setList([...list]);
                                event.preventDefault();
                            }}
                        >{item.name}</div>
                    } */}
                    {/* <div>{}</div>
                    <div>改</div>
                    <div>删</div> */}
                    {item.name}
                </div>)
            }
            <div
                className={classNames(styles.nav_item, styles.nav_item_new)}
                onClick={() => {
                    list.push({
                        edit: true,
                    })
                    setList([...list]);
                }}
            >+</div>
        </nav>
        {console.log()}
        <div className={styles.container}>
            <textarea
                className={styles.textarea}
                onChange={(event) => {
                    list[index].value = event.target.value;
                }}
            >{list[index]?.value}</textarea>
        </div>
    </div>
}

ReactDOM.render(<Pages />, document.getElementById('App'));
