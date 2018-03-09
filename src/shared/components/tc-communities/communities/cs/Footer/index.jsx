import React from 'react';
import PT from 'prop-types';
import { themr } from 'react-css-super-themr';

import defaultStyle from './style.scss';

function Footer(props) {
  return (
    <footer className={props.theme.footer}>
      <div className={props.theme.footerText}>
        &copy; Copyright Topcoder 2017
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  text: '',
  theme: {
    footer: '',
    footerText: '',
  },
};

Footer.propTypes = {
  theme: PT.shape({
    footer: PT.string.isRequired,
    footerText: PT.string,
  }),
};

export default themr('Footer', defaultStyle)(Footer);
