import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setOverlayLoaderState } from 'actions/interaction';

import styles from 'styles/ExportPdf.module.scss';

import ShoppingListPdf from './components/ShoppingListPdf';

const ExportShoppingListPdf = ({ setOverlayLoaderState }) => {
  const componentRef = useRef();
  return (
    <div className={styles['main-pdf-container']}>
      <ShoppingListPdf ref={componentRef} />
      <div className={styles['export-button-container']}>
        <ReactToPrint
          content={() => componentRef.current}
          trigger={() => <button className={styles['export-button']}>Export PDF</button>}
          print={p => {
            setOverlayLoaderState('loader');
            setTimeout(() => {
              setOverlayLoaderState('none');
              p.contentWindow.print();
            }, 3000);
          }}
        />
      </div>
    </div>
  );
};

ExportShoppingListPdf.propTypes = {
  setOverlayLoaderState: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setOverlayLoaderState,
};

export default connect(null, mapDispatchToProps)(ExportShoppingListPdf);
