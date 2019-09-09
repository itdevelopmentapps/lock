import React from 'react';
import uuid from 'uuid';
import EmailPane from '../../field/email/email_pane';
import PasswordPane from '../../field/password/password_pane';
import UsernamePane from '../../field/username/username_pane';
import CustomInput from '../../field/custom_input';
import {
  additionalSignUpFields,
  databaseConnectionRequiresUsername,
  passwordStrengthPolicy
} from '../../connection/database/index';

export default class SignUpPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = { uuid: uuid() };
  }

  render() {
    const {
      emailInputPlaceholder,
      instructions,
      i18n,
      model,
      onlyEmail,
      passwordInputPlaceholder,
      passwordStrengthMessages,
      usernameInputPlaceholder
    } = this.props;

    const headerText = instructions || null;
    const header = headerText && <p>{headerText}</p>;

    const usernamePane =
      !onlyEmail && databaseConnectionRequiresUsername(model) ? (
        <UsernamePane
          initialValue={this.state.uuid}
          type="hidden"
          disabled={true}
          i18n={i18n}
          lock={model}
          placeholder={usernameInputPlaceholder}
          validateFormat={true}
        />
      ) : null;

    const fields =
      !onlyEmail &&
      additionalSignUpFields(model).map(x => (
        <CustomInput
          iconUrl={x.get('icon')}
          key={x.get('name')}
          model={model}
          name={x.get('name')}
          ariaLabel={x.get('ariaLabel')}
          options={x.get('options')}
          placeholder={x.get('placeholder')}
          type={x.get('type')}
          validator={x.get('validator')}
          value={x.get('value')}
        />
      ));

    const passwordPane = !onlyEmail && (
      <PasswordPane
        i18n={i18n}
        lock={model}
        placeholder={passwordInputPlaceholder}
        policy={passwordStrengthPolicy(model)}
        strengthMessages={passwordStrengthMessages}
      />
    );

    return (
      <div>
        {header}
        <EmailPane i18n={i18n} lock={model} placeholder={emailInputPlaceholder} />
        {usernamePane}
        {passwordPane}
        {fields}
      </div>
    );
  }
}
