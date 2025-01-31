import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import StatePicker from '../../components/StatePicker';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Text from '../../components/Text';
import CONST from '../../CONST';
import DatePicker from '../../components/DatePicker';


const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Callback fired when a field changes. Passes args as fieldName, val */
    onFieldChange: PropTypes.func.isRequired,

    /** Form values */
    values: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,

        /** Date of birth field */
        dob: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

        /** Last 4 digits of SSN */
        ssnLast4: PropTypes.string,
    }),

    /** Any errors that can arise from form validation */
    errors: PropTypes.objectOf(PropTypes.bool),

    ...withLocalizePropTypes,
};

const defaultProps = {
    style: {},
    values: {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        dob: '',
        ssnLast4: '',
    },
    errors: {},
};


const IdentityForm = ({
    translate, values, onFieldChange, style, errors,
}) => {
    const {
        firstName, lastName, street, city, state, zipCode, dob, ssnLast4,
    } = values;

    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (errors.dob ? translate('bankAccount.error.dob') : '')
        || (errors.dobAge ? translate('bankAccount.error.age') : '');

    return (
        <View style={style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <ExpensiTextInput
                        label={`${translate('common.firstName')}`}
                        value={firstName}
                        onChangeText={value => onFieldChange('firstName', value)}
                        errorText={errors.firstName ? translate('bankAccount.error.firstName') : ''}
                        translateX={-10}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <ExpensiTextInput
                        label={`${translate('common.lastName')}`}
                        value={lastName}
                        onChangeText={value => onFieldChange('lastName', value)}
                        errorText={errors.lastName ? translate('bankAccount.error.lastName') : ''}
                        translateX={-10}
                    />
                </View>
            </View>
            <DatePicker
                label={`${translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={translate('common.dateFormat')}
                value={dob}
                onChange={value => onFieldChange('dob', value)}
                errorText={dobErrorText}
            />
            <ExpensiTextInput
                label={`${translate('common.ssnLast4')}`}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                value={ssnLast4}
                onChangeText={value => onFieldChange('ssnLast4', value)}
                errorText={errors.ssnLast4 ? translate('bankAccount.error.ssnLast4') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            <ExpensiTextInput
                label={translate('common.personalAddress')}
                containerStyles={[styles.mt4]}
                value={street}
                onChangeText={value => onFieldChange('street', value)}
                errorText={errors.street ? translate('bankAccount.error.address') : ''}
            />
            <Text style={[styles.mutedTextLabel, styles.mt1]}>{translate('common.noPO')}</Text>
            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <ExpensiTextInput
                        label={translate('common.city')}
                        value={city}
                        onChangeText={value => onFieldChange('city', value)}
                        errorText={errors.city ? translate('bankAccount.error.addressCity') : ''}
                        translateX={-14}
                    />
                </View>
                <View style={[styles.flex1]}>
                    <StatePicker
                        value={state}
                        onChange={value => onFieldChange('state', value)}
                        errorText={errors.state ? translate('bankAccount.error.addressState') : ''}
                        hasError={Boolean(errors.state)}
                    />
                </View>
            </View>
            <ExpensiTextInput
                label={translate('common.zip')}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                value={zipCode}
                onChangeText={value => onFieldChange('zipCode', value)}
                errorText={errors.zipCode ? translate('bankAccount.error.zipCode') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
            />
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
export default withLocalize(IdentityForm);
