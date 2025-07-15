import React from 'react';
import ReactDOM from 'react-dom';
import Pages from '../home';
import styles from './style.less';

ReactDOM.render(<Pages isOptions styles={styles} />, document.getElementById('App'));