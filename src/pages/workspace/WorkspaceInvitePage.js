import React from 'react';
import PropTypes from 'prop-types';
import {
    View, ScrollView, Pressable, Linking,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import {hideWorkspaceAlertMessage, invite, setWorkspaceErrors} from '../../libs/actions/Policy';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import {isSystemUser} from '../../libs/userUtils';
import {addSMSDomainIfPhoneNumber} from '../../libs/OptionsListUtils';
import Icon from '../../components/Icon';
import {NewWindow} from '../../components/Icon/Expensicons';
import variables from '../../styles/variables';
import CONST from '../../CONST';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const propTypes = {
    ...withLocalizePropTypes,

    /** The policy passed via the route */
    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    policy: {
        name: '',
    },
};

class WorkspaceInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userLogins: '',
            welcomeNote: this.getWelcomeNotePlaceholder(),
            foundSystemLogin: '',
        };

        this.focusEmailOrPhoneInput = this.focusEmailOrPhoneInput.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
        this.emailOrPhoneInputRef = null;
    }

    componentDidMount() {
        this.clearErrors();
    }

    /**
     * Gets the welcome note default text
     *
     * @returns {Object}
     */
    getWelcomeNotePlaceholder() {
        return this.props.translate('workspace.invite.welcomeNote', {
            workspaceName: this.props.policy.name,
        });
    }

    /**
     * @returns {String}
     */
    getErrorText() {
        const errors = lodashGet(this.props.policy, 'errors', {});

        if (errors.invalidLogin) {
            return this.props.translate('workspace.invite.pleaseEnterValidLogin');
        }

        if (errors.systemUserError) {
            return this.props.translate('workspace.invite.systemUserError', {email: this.state.foundSystemLogin});
        }

        if (errors.duplicateLogin) {
            return this.props.translate('workspace.invite.pleaseEnterUniqueLogin');
        }

        return '';
    }

    /**
     * @returns {Boolean}
     */
    getShouldShowAlertPrompt() {
        return _.size(lodashGet(this.props.policy, 'errors', {})) > 0 || this.props.policy.alertMessage.length > 0;
    }

    clearErrors() {
        setWorkspaceErrors(this.props.route.params.policyID, {});
        hideWorkspaceAlertMessage(this.props.route.params.policyID);
    }

    focusEmailOrPhoneInput() {
        if (!this.emailOrPhoneInputRef) {
            return;
        }
        this.emailOrPhoneInputRef.focus();
    }

    /**
     * Handle the invite button click
     */
    inviteUser() {
        if (!this.validate()) {
            return;
        }

        const logins = _.map(_.compact(this.state.userLogins.split(',')), login => login.trim());
        invite(logins, this.state.welcomeNote || this.getWelcomeNotePlaceholder(),
            this.props.route.params.policyID);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const logins = _.map(_.compact(this.state.userLogins.split(',')), login => login.trim());
        const isEnteredLoginsvalid = _.every(logins, login => Str.isValidEmail(login) || Str.isValidPhone(login));
        const errors = {};
        let foundSystemLogin = '';
        if (logins.length <= 0 || !isEnteredLoginsvalid) {
            errors.invalidLogin = true;
        }

        foundSystemLogin = _.find(logins, login => isSystemUser(login));
        if (foundSystemLogin) {
            errors.systemUserError = true;
        }

        const policyEmployeeList = lodashGet(this.props, 'policy.employeeList', []);
        const areLoginsDuplicate = _.some(logins, login => _.contains(policyEmployeeList, addSMSDomainIfPhoneNumber(login)));
        if (areLoginsDuplicate) {
            errors.duplicateLogin = true;
        }

        this.setState({foundSystemLogin}, () => setWorkspaceErrors(this.props.route.params.policyID, errors));
        return _.size(errors) <= 0;
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={this.focusEmailOrPhoneInput}>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('workspace.invite.invitePeople')}
                        onCloseButtonPress={() => {
                            this.clearErrors();
                            Navigation.dismissModal();
                        }}
                    />
                    <ScrollView
                        style={[styles.w100, styles.flex1]}
                        ref={el => this.form = el}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Form elements */}
                        <View style={[styles.mh5, styles.mb5]}>
                            <Text style={[styles.mb6]}>
                                {this.props.translate('workspace.invite.invitePeoplePrompt')}
                            </Text>
                            <View style={styles.mb6}>
                                <ExpensiTextInput
                                    ref={el => this.emailOrPhoneInputRef = el}
                                    label={this.props.translate('workspace.invite.enterEmailOrPhone')}
                                    placeholder={this.props.translate('workspace.invite.EmailOrPhonePlaceholder')}
                                    autoCompleteType="email"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    multiline
                                    numberOfLines={2}
                                    value={this.state.userLogins}
                                    onChangeText={(text) => {
                                        this.clearErrors();
                                        this.setState({userLogins: text, foundSystemLogin: ''});
                                    }}
                                    errorText={this.getErrorText()}
                                />
                            </View>
                            <View style={styles.mb6}>
                                <ExpensiTextInput
                                    label={this.props.translate('workspace.invite.personalMessagePrompt')}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    multiline
                                    value={this.state.welcomeNote}
                                    placeholder={this.getWelcomeNotePlaceholder()}
                                    onChangeText={text => this.setState({welcomeNote: text})}
                                />
                                <View style={[styles.mt5, styles.alignSelfStart]}>
                                    <Pressable
                                        onPress={(e) => {
                                            e.preventDefault();
                                            Linking.openURL(CONST.PRIVACY_URL);
                                        }}
                                        accessibilityRole="link"
                                        href={CONST.PRIVACY_URL}
                                    >
                                        {({hovered, pressed}) => (
                                            <View style={[styles.flexRow]}>
                                                <Text
                                                    style={[
                                                        styles.mr1,
                                                        styles.label,
                                                        (hovered || pressed) ? styles.linkMutedHovered : styles.linkMuted,
                                                    ]}
                                                >
                                                    {this.props.translate('common.privacyPolicy')}
                                                </Text>
                                                <View style={styles.alignSelfCenter}>
                                                    <Icon
                                                        src={NewWindow}
                                                        width={variables.iconSizeSmall}
                                                        height={variables.iconSizeSmall}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        <FormAlertWithSubmitButton
                            isAlertVisible={this.getShouldShowAlertPrompt()}
                            buttonText={this.props.translate('common.invite')}
                            onSubmit={this.inviteUser}
                            onFixTheErrorsLinkPressed={() => {
                                this.form.scrollTo({y: 0, animated: true});
                            }}
                            message={this.props.policy.alertMessage}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
    }),
)(WorkspaceInvitePage);
