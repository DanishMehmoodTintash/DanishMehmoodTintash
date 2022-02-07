import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ styles }) => {
  return (
    <div className={styles}>
      <div className="lds-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

Loader.propTypes = {
  styles: PropTypes.string.isRequired,
};

export default Loader;
