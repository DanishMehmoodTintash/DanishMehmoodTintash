import React, { useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const OutsideClickHandler = ({ children, onOutsideClick, ignoreList, container }) => {
  const isMobile = useMemo(() => window.innerWidth <= 600, [window.innerWidth]);

  const wrapperRef = useRef(null);
  const dragRef = useRef(null);

  const isInIgnoreList = el => {
    let isPresent = false;
    ignoreList.forEach(node => {
      if (node.contains(el)) {
        isPresent = true;
      }
    });
    return isPresent;
  };

  const handleClickOutside = event => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target) &&
      !isInIgnoreList(event.target) &&
      !isMobile
    ) {
      onOutsideClick();
    }
  };

  const mouseDownListener = () => {
    dragRef.current = false;
  };

  const mouseMoveListener = () => {
    dragRef.current = true;
  };

  const mouseUpListener = event => {
    if (!dragRef.current) {
      handleClickOutside(event);
    }
  };

  useEffect(() => {
    container?.addEventListener('mousedown', mouseDownListener);
    container?.addEventListener('mousemove', mouseMoveListener);
    container?.addEventListener('mouseup', mouseUpListener);

    return () => {
      container?.removeEventListener('mousedown', mouseDownListener);
      container?.removeEventListener('mousemove', mouseMoveListener);
      container?.removeEventListener('mouseup', mouseUpListener);
    };
  }, [container, ignoreList]);

  return <div ref={wrapperRef}>{children}</div>;
};

OutsideClickHandler.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onOutsideClick: PropTypes.func.isRequired,
  container: PropTypes.instanceOf(Element),
  ignoreList: PropTypes.instanceOf(NodeList),
};

OutsideClickHandler.defaultProps = {
  ignoreList: null,
  container: null,
};

export default OutsideClickHandler;
