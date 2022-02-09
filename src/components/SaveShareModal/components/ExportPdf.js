import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from 'components/common/Actions';
import ExportShoppingListPdf from 'components/ExportShoppingListPdf';

const ExportPdf = ({ styles, onBackButtonClick, onCloseButtonClick }) => {
  return (
    <>
      <div className={styles['actions-container']}>
        <Actions
          styles={styles}
          onCloseButtonClick={onCloseButtonClick}
          onBackButtonClick={onBackButtonClick}
          backButtonText="back"
        />
      </div>
      <ExportShoppingListPdf />
    </>
  );
};

ExportPdf.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onCloseButtonClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentCollection: state.collection.get('currentCollection'),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ExportPdf);
