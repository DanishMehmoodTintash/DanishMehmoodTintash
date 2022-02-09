import React, { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

import styles from 'styles/Loader.module.scss';

const Loader = ({ progress }) => {
  const loaderProgressRef = useRef(null);

  useLayoutEffect(() => {
    loaderProgressRef.current.style.width = `${progress}%`;
  }, [progress]);

  return (
    <div className={styles['progress-horizontal']} id="zip-progress">
      <div className={styles.progress}>
        <div
          ref={loaderProgressRef}
          className={`${styles['progress-bar']} ${styles['bg-prog']}`}
        />
      </div>
      <div className={`${styles['build-text']} ${styles['proxima-semibold']}`}>
        Building your room...
      </div>
    </div>
  );
};

Loader.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default Loader;
