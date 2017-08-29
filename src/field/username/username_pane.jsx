import PropTypes from 'prop-types';
import React from 'react';
import UsernameInput from '../../ui/input/username_input';
import * as c from '../index';
import { swap, updateEntity } from '../../store/index';
import * as l from '../../core/index';
import { setUsername, usernameLooksLikeEmail, getUsernameValidation } from '../username';
import { debouncedRequestAvatar, requestAvatar } from '../../avatar';

export default class UsernamePane extends React.Component {
  componentDidMount() {
    const { lock, validateFormat, usernameStyle, initialValue } = this.props;
    if (l.ui.avatar(lock) && c.username(lock)) {
      requestAvatar(l.id(lock), c.username(lock));
    }

    this.updateValue(lock, validateFormat, usernameStyle, initialValue);
  }

  updateValue(lock, validateFormat, usernameStyle, value) {
    swap(updateEntity, 'lock', l.id(lock), setUsername, value, usernameStyle, validateFormat);
  }

  handleChange(e) {
    const { lock, validateFormat, usernameStyle } = this.props;
    if (l.ui.avatar(lock)) {
      debouncedRequestAvatar(l.id(lock), e.target.value);
    }

    this.updateValue(lock, validateFormat, usernameStyle, e.target.value);
  }

  handleBlur() {
    const { lock } = this.props;
    const connectionResolver = l.connectionResolver(lock);
    if (!connectionResolver) {
      return;
    }
    const { connections, id } = lock.get('client').toJS();
    const context = { connections, id };
    connectionResolver(c.getFieldValue(lock, 'username'), context, resolvedConnection => {
      swap(updateEntity, 'lock', l.id(lock), m => l.setResolvedConnection(m, resolvedConnection));
    });
  }

  render() {
    const { i18n, lock, placeholder, validateFormat } = this.props;
    const allowAutocomplete = l.ui.allowAutocomplete(lock);
    const value = c.getFieldValue(lock, 'username');
    const usernameValidation = validateFormat ? getUsernameValidation(lock) : {};

    const invalidHintKey = str => {
      if (!str) return 'blankErrorHint';
      if (usernameLooksLikeEmail(str) || !validateFormat) return 'invalidErrorHint';
      return 'usernameFormatErrorHint';
    };

    const invalidHint = str => {
      const hintKey = invalidHintKey(str);

      // only show format info in the error if it should validate the format and
      // if there is any format restrictions for the connection
      if ('usernameFormatErrorHint' === hintKey && validateFormat && usernameValidation != null) {
        return i18n.str(hintKey, usernameValidation.min, usernameValidation.max);
      }

      return i18n.str(hintKey);
    };

    return (
      <UsernameInput
        value={value}
        invalidHint={invalidHint(value)}
        isValid={!c.isFieldVisiblyInvalid(lock, 'username')}
        onChange={::this.handleChange}
        onBlur={::this.handleBlur}
        placeholder={placeholder}
        autoComplete={allowAutocomplete}
      />
    );
  }
}

UsernamePane.propTypes = {
  i18n: PropTypes.object.isRequired,
  lock: PropTypes.object.isRequired,
  initialValue: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  validateFormat: PropTypes.bool.isRequired,
  usernameStyle: PropTypes.oneOf(['any', 'email', 'username'])
};

UsernamePane.defaultProps = {
  validateFormat: false,
  initialValue: '',
  usernameStyle: 'username'
};
