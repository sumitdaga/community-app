/**
 * render Device list
 */
import React from 'react';
import PT from 'prop-types';
import Item from './Item';

import './styles.scss';

export default function DeviceList(props) {
  const {
    deviceList,
    onDeleteItem,
    disabled,
    onEditItem,
  } = props;

  return (
    <div styleName={`container ${deviceList.items.length > 0 ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
      <ul>
        {
          deviceList.items.map((device, index) => (
            device
              ? (
                <li key={`${device.deviceType}${index + 1}`}>
                  <Item
                    device={device}
                    index={index}
                    onDeleteItem={onDeleteItem}
                    onEditItem={onEditItem}
                  />
                </li>
              ) : undefined
          ))
        }
      </ul>
    </div>
  );
}

DeviceList.propTypes = {
  deviceList: PT.shape().isRequired,
  onDeleteItem: PT.func.isRequired,
  onEditItem: PT.func.isRequired,
  disabled: PT.bool,
};

DeviceList.defaultProps = {
  disabled: false,
};
