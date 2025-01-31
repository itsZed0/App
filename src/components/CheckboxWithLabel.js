import React from 'react';
import PropTypes from 'prop-types';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Checkbox from './Checkbox';
import Text from './Text';
import InlineErrorText from './InlineErrorText';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Text that appears next to check box */
    label: PropTypes.string,

    /** Component to display for label */
    LabelComponent: PropTypes.func,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,
};

const defaultProps = {
    style: [],
    label: undefined,
    LabelComponent: undefined,
    hasError: false,
    errorText: '',
};

const CheckboxWithLabel = ({
    LabelComponent, isChecked, onPress, style, label, hasError, errorText,
}) => {
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];
    const wrapperStyles = _.isArray(style) ? [...defaultStyles, ...style] : [...defaultStyles, style];

    if (!label && !LabelComponent) {
        throw new Error('Must provide at least label or LabelComponent prop');
    }
    return (
        <>
            <View style={wrapperStyles}>
                <Checkbox
                    isChecked={isChecked}
                    onPress={() => onPress(!isChecked)}
                    label={label}
                    hasError={hasError}
                />
                <TouchableOpacity
                    onPress={() => onPress(!isChecked)}
                    style={[
                        styles.ml3,
                        styles.pr2,
                        styles.w100,
                        styles.flexRow,
                        styles.flexWrap,
                        styles.flexShrink1,
                        styles.alignItemsCenter,
                    ]}
                >
                    {label && (
                        <Text style={[styles.ml2]}>
                            {label}
                        </Text>
                    )}
                    {LabelComponent && (<LabelComponent />)}
                </TouchableOpacity>
            </View>
            {!_.isEmpty(errorText) && (
                <InlineErrorText>
                    {errorText}
                </InlineErrorText>
            )}
        </>
    );
};

CheckboxWithLabel.propTypes = propTypes;
CheckboxWithLabel.defaultProps = defaultProps;
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

export default CheckboxWithLabel;
