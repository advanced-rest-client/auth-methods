/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import {EventsTargetMixin} from '../../@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {AmfHelperMixin} from '../../@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {AuthMethodsMixin} from './auth-methods-mixin.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@polymer/polymer/lib/elements/dom-if.js';
import '../../@advanced-rest-client/paper-masked-input/paper-masked-input.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@polymer/paper-styles/paper-styles.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/iron-form/iron-form.js';
import '../../@polymer/paper-item/paper-item.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../../@polymer/paper-listbox/paper-listbox.js';
import '../../@advanced-rest-client/oauth2-scope-selector/oauth2-scope-selector.js';
import '../../@polymer/paper-spinner/paper-spinner.js';
import '../../@polymer/iron-collapse/iron-collapse.js';
import '../../@polymer/paper-ripple/paper-ripple.js';
import '../../@polymer/paper-checkbox/paper-checkbox.js';
import '../../@advanced-rest-client/clipboard-copy/clipboard-copy.js';
import '../../@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '../../@api-components/api-property-form-item/api-property-form-item.js';
import '../../@polymer/marked-element/marked-element.js';
import '../../@advanced-rest-client/markdown-styles/markdown-styles.js';
import '../../@polymer/iron-meta/iron-meta.js';
import './auth-methods-styles.js';
import './auth-method-step.js';
/**
 * The `<auth-method-oauth2>` element displays a form to provide the OAuth 2.0 settings.
 *
 * ### Example
 *
 * ```html
 * <auth-method-oauth2></auth-method-oauth2>
 * ```
 *
 * This element uses `oauth2-scope-selector` so the `allowedScopes`, `preventCustomScopes` and
 * `scopes` properties will be set on this element. See documentation of `oauth2-scope-selector`
 * for more description.

 * ### Forcing the user to select scope from the list
 *
 * ```html
 * <auth-method-oauth2 prevent-custom-scopes></auth-method-oauth2>
 * ```
 *
 * ```javascript
 * var form = document.querySelector('auth-method-oauth2');
 * form.allowedScopes = ['profile', 'email'];
 * ```
 *
 * ## Authorizing the user
 * The element sends the `oauth2-token-requested` with the OAuth settings provided with the form.
 * Any element / app can handle this event and perform authorization.
 * *
 * When the authorization is performed the app / other element should set back `accessToken` property
 * of this element or send the `oauth2-token-response` with token response value so the change will
 * can reflected in the UI.
 * ARC provides the `oauth2-authorization` element that can handle this events.
 *
 * ### Example
 *
 * ```html
 * <auth-method-oauth2></auth-method-oauth2>
 * <oauth2-authorization></oauth2-authorization>
 * ```
 *
 * The `oauth2-authorization` can be set anywhere in the DOM up from this element siblings to the
 * body. See demo for example usage.
 *
 ## Redirect URL
 * Most OAuth 2 providers requires setting the redirect URL with the request. This can't be changed
 * by the user and redirect URL can be only set in the provider's settings panel. The element
 * accepts the `redirectUri` property which will be displayed to the user that (s)he has to set up
 * this callback URL in the OAuth provider settings. It can be any URL where token / code will be
 * handled properly and the value returned to the `oauth2-authorization` element.
 * See `oauth2-authorization` documentation for more information.
 *
 * If you going to use `oauth2-authorization` popup then the redirect URL value must be set to:
 * `/bower_components/oauth-authorization/oauth-popup.html`. Mind missing `2` in `oauth-authorization`.
 * This popup is a common popup for auth methods.
 *
 * ### OAuth 2.0 extensibility
 *
 * As per [RFC6749, section 8](https://tools.ietf.org/html/rfc6749#section-8) OAuth 2.0
 * protocol can be extended by custom `grant_type`, custom query parameters and custom headers.
 *
 * This is not yet supported in RAML. However, working together with RAML spec creators,
 * an official RAML annotation to extend OAuth 2.0 settings has been created.
 * The annotation source can be found in the [RAML organization repository]
 * (https://github.com/raml-org/raml-annotations/blob/master/annotations/security-schemes/oauth-2-custom-settings.raml).
 *
 * When the annotation is applied to the `ramlSettings` property, this element renders
 * additional form inputs to support custom schemes.
 *
 * This produces additional property in the token authorization request: `customData`.
 * The object contains user input from custom properties.
 * *
 * #### `customData` model
 *
 * ```json
 * customData: {
 *  auth: {
 *    parameters: Array|undefined
 *  },
 *  token: {
 *    parameters: Array|undefined,
 *    headers: Array|undefined,
 *    body: Array|undefined
 *  }
 * }
 * ```
 * `auth` contains properties to be applied to the authorization request.
 * Only query parameetrs are (and can be) supported.
 *
 * `token` property contains properties to be applied when making token request.
 * It can include `parameters` as a query parameters, `headers` as a list
 * of headers to apply, and `body` as a list of properties to send with
 * body.
 *
 * Note: `body` content type is always `application/x-www-form-urlencoded`.
 * `customData.token.body` parameters must not be url encoded. Processors
 * handing token request should handle values encoding.
 *
 * #### Annotation example
 *
 * ```yaml
 *  annotationTypes:
 *    customSettings: !include oauth-2-custom-settings.raml
 *  securitySchemes:
 *    oauth2:
 *      type: OAuth 2.0
 *      describedBy:
 *        headers:
 *          Authorization:
 *            example: "Bearer token"
 *      settings:
 *        (customSettings):
 *          authorizationSettings:
 *            queryParameters:
 *              resource:
 *                type: string
 *                required: true
 *                description: |
 *                  A resource ID that defines a domain of authorization.
 *          accessTokenSettings:
 *            body:
 *              resource:
 *                type: string
 *                required: true
 *                description: |
 *                  A resource ID that defines a domain of authorization.
 *        accessTokenUri: https://auth.domain.com/authorize
 *        authorizationUri: https://auth.domain.com/token
 *        authorizationGrants: [code]
 *     scopes: profile
 * ```
 *
 * ## clientId and clientSecret
 *
 * In RAML there's no way to set an example or demo clientId/secret for the
 * tools like API console. This component supports reading data from
 * Polymer's `iron-meta` component. Meta components creeated with
 * `oauth2-client-id` and `oauth2-client-secret` will be used to prepopulate
 * the form if the form doesn't contain this properties already.
 *
 * Note, values changed by the user are persistant per browser session
 * (until browser is closed). Refresing the page will restore user input
 * instead the one defined in `iron-meta` elements.
 *
 * ### Example
 *
 * ```html
 * <iron-meta key="oauth2-client-id" value="abcd"></iron-meta>
 * <iron-meta key="oauth2-client-secret" value="efgh"></iron-meta>
 * ```
 *
 * ## Styling
 *
 * `<auth-method-oauth2>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--auth-method-oauth2` | Mixin applied to the element. | `{}`
 * `--auth-method-panel` | Mixin applied to all auth elements. | `{}`
 * `--auth-grant-dropdown` | Mixin applied to the authorization grants dropdown list | `{}`
 *
 * This is very basic element. Style inputs using `paper-input`'s or `
 * paper-toggle`'s css variables.
 *
 * ### Theming
 * Use this mixins as a theming option across all ARC elements.
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--icon-button` | Mixin applied to `paper-icon-buttons`. | `{}`
 * `--icon-button-hover` | Mixin applied to `paper-icon-buttons` when hovered. | `{}`
 * `--input-line-color` | Mixin applied to the input underline | `{}`
 * `--form-label` | Mixin applied to form labels. It will not affect `paper-*` labels | `{}`
 * `--auth-button` | Mixin applied to authorization action buttons | `{}`
 * `--auth-button-hover` | Mixin applied to authorization buttons when hovered | `{}`
 * `--auth-button-disabled` | Mixin applied to authorization buttons when disabled | `{}`
 * `--auth-button-narrow` | Mixin applied to authorization action buttons when narrow layout | `{}`
 * `--auth-button-narrow-hover` | Mixin applied to authorization buttons when hovered and narrow layout | `{}`
 * `--auth-button-narrow-disabled` | | Mixin applied to authorization buttons when disabled and narrow layout | `{}`
 * `--auth-redirect-section` | Mixin applied to the redirect uri section | `{}`
 * `--error-toast` | Mixin applied to the error toast message | `{}`
 * `--warning-primary-color` | Error toast background color | `#FF7043`
 * `--warning-contrast-color` | Error toast color | `#fff`
 *
 * ## Changes in version 2
 *
 * - Renamed properties
 *  - `authUrl` -> `authorizationUri`
 *  - `redirectUrl` -> `redirectUri`
 *  - `accessTokenUrl` -> `accessTokenUri`
 *  - `tokenValue` -> `accessToken`
 *  - `hasTokenValue` -> `hasAccessToken`
 * - Added `tokenType` to the events describing type of the token.
 * By default it's `Bearer`
 * - **The element does not support RAML js data model anymore**. It uses
 * [AMF](https://github.com/mulesoft/amf/) `json/ld` model. Use AMF to read
 * API spec file (RAML, OAS, etc) and load settings via `amfSettings`
 * property
 * - Added `deliveryMethod` and `deliveryName` properties to the
 * `detail.setting` object.
 *
 * @customElement
 * @polymer
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 * @appliesMixin ArcBehaviors.AuthMethodsMixin
 * @appliesMixin ApiElements.AmfHelperMixin
 * @demo demo/oauth2.html
 * @demo demo/oauth2-amf.html Using AMF data model
 */
class AuthMethodOauth2 extends AmfHelperMixin(AuthMethodsMixin(EventsTargetMixin(PolymerElement))) {
  static get template() {
    return html`<style include="markdown-styles"></style>
    <style include="auth-methods-styles">
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --auth-method-panel;
      @apply --auth-method-oauth2;

      --paper-icon-button: {
        color: var(--hint-trigger-color, rgba(0, 0, 0, 0.74));
        transition: color 0.25s linear;
        @apply --icon-button;
      }

      --paper-icon-button-hover: {
        color: var(--hint-trigger-hover-color, rgba(0, 0, 0, 0.88));
        @apply --icon-button-hover;
      }
    }

    .form {
      @apply --layout-flex;
      max-width: 700px;
    }

    oauth2-scope-selector {
      margin: 24px 0;
      outline: none;
    }

    .grant-dropdown {
      width: 320px;
      @apply --auth-grant-dropdown;
    }

    .auth-button {
      color: var(--secondary-color);
      background-color: #fff;
      @apply --auth-button;
    }

    .auth-button:hover {
      @apply --auth-button-hover;
    }

    .auth-button[disabled] {
      background-color: rgba(0, 0, 0, 0.24);
      color: rgba(0, 0, 0, 0.54);
      @apply --auth-button-disabled;
    }

    :host([narrow]) .auth-button {
      @apply --auth-button-narrow;
    }

    :host([narrow]) .auth-button:hover {
      @apply --auth-button-narrow-hover;
    }

    :host([narrow]) .auth-button[disabled] {
      @apply --auth-button-narrow-disabled;
    }

    .authorize-actions {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .authorize-actions > paper-button {
      margin: 0;
    }

    .authorize-actions > paper-spinner {
      margin-left: 12px;
    }

    .read-only-param-field {
      background-color: rgba(0, 0, 0, 0.12);
      @apply --arc-font-body1;
      display: block;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      @apply --layout-horizontal;
    }

    .read-only-param-field.padding {
      padding: 12px;
    }

    label {
      @apply --form-label;
    }

    .token-info,
    .redirect-info {
      @apply --arc-font-body1;
      font-weight: 200;
      color: var(--auth-method-oauth2-redirect-info-color, rgba(0, 0, 0, 0.74));
    }

    .code {
      @apply --arc-font-code1;
      @apply --layout-flex;
      outline: none;
      cursor: text;
    }

    .token-label {
      font-weight: 500;
      font-size: 16px;
    }

    .current-token {
      margin-top: 12px;
    }

    .redirect-section,
    oauth2-scope-selector {
      max-width: 560px;
      box-sizing: border-box;
    }

    .redirect-section {
      @apply --auth-redirect-section;
    }

    *[hiddable] {
      display: none;
    }

    *[data-grant="authorization_code"] *[data-visible~="authorization_code"],
    *[data-grant="client_credentials"] *[data-visible~="client_credentials"],
    *[data-grant="implicit"] *[data-visible~="implicit"],
    *[data-grant="password"] *[data-visible~="password"] {
      display: block;
    }

    form[is-custom-grant] *[data-visible] {
      display: block !important;
    }

    .custom-data-field-value {
      @apply --layout-horizontal;
      @apply --layout-flex;
    }

    api-property-form-item {
      @apply --layout-flex;
    }

    h4 {
      @apply --arc-font-subhead;
    }

    .help-icon {
      margin-top: 16px;
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
      @apply --error-toast;
    }

    api-property-form-item[is-array] {
      margin-top: 8px;
    }

    paper-item:hover {
      @apply --paper-item-hover;
    }

    #redirectCopyButton {
      @apply --secondary-button;
    }

    #redirectCopyButton:hover {
      @apply --secondary-button-hover;
    }
    </style>
    <iron-form data-grant\$="[[grantType]]">
      <form autocomplete="on" is-custom-grant\$="[[isCustomGrant]]">
        <auth-method-step step-start-index="[[stepStartIndex]]"
          step="1"
          no-steps="[[noSteps]]"
          inactive="[[isSelectedType]]"
          hidden\$="[[noGrantType]]"
          on-inactive-tap="_clearTypeSelection">
          <span slot="title">Grant type</span>
          <span slot="inactive-title">[[_computeSelectedTypeLabel(grantType)]]</span>
          <paper-dropdown-menu label="Grant type" class="grant-dropdown" required="" auto-validate="">
            <paper-listbox slot="dropdown-content" selected="{{grantType}}" attr-for-selected="data-type">
              <template is="dom-repeat" items="[[grantTypes]]">
                <paper-item data-type\$="[[item.type]]">[[item.label]]</paper-item>
              </template>
            </paper-listbox>
          </paper-dropdown-menu>
        </auth-method-step>
        <auth-method-step step-start-index="[[stepStartIndex]]" step="2" no-steps="[[noSteps]]">
          <span slot="title">Authorization data</span>
          <section>
            <paper-masked-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="clientid" label="Client id" value="{{clientId}}" autocomplete="on" title="Your client ID registered in your OAuth provider."></paper-masked-input>
            <paper-masked-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="clientsecret" label="Client secret" value="{{clientSecret}}" hiddable="" data-visible="client_credentials authorization_code" disabled\$="[[_isFieldDisabled(isCustomGrant, grantType, 'client_credentials', 'authorization_code')]]" autocomplete="on" title="The client secret is generated by your provider unique string for your app. Check provider's console to get the code."></paper-masked-input>
            <template is="dom-if" if="[[authQueryParameters]]" restamp="">
              <h4>Authorization request query parameters</h4>
              <template is="dom-repeat" items="{{authQueryParameters}}" data-repeater="auth-query">
                <div class="custom-data-field auth-query-parameter">
                  <div class="custom-data-field-value">
                    <api-property-form-item model="[[item]]" name="[[item.name]]" value="{{item.value}}" data-type="auth-query"></api-property-form-item>
                    <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                      <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="auth-query" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                    </template>
                  </div>
                  <div class="custom-data-field-docs docs-container" data-source="auth-query" data-key\$="[[item.name]]"></div>
                </div>
              </template>
            </template>
            <template is="dom-if" if="[[tokenQueryParameters]]" restamp="">
              <h4>Token request query parameters</h4>
              <template is="dom-repeat" items="{{tokenQueryParameters}}" data-repeater="token-query">
                <div class="custom-data-field token-query-parameter">
                  <div class="custom-data-field-value">
                    <api-property-form-item model="[[item]]" name="[[item.name]]" value="{{item.value}}" data-type="token-query"></api-property-form-item>
                    <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                      <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="token-query" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                    </template>
                  </div>
                  <div class="custom-data-field-docs docs-container" data-source="token-query" data-key\$="[[item.name]]"></div>
                </div>
              </template>
            </template>
            <template is="dom-if" if="[[tokenHeaders]]" restamp="">
              <h4>Token request headers</h4>
              <template is="dom-repeat" items="{{tokenHeaders}}" data-repeater="token-headers">
                <div class="custom-data-field token-header">
                  <div class="custom-data-field-value">
                    <api-property-form-item model="[[item]]" name="[[item.name]]" value="{{item.value}}" data-type="token-headers"></api-property-form-item>
                    <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                      <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="token-headers" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                    </template>
                  </div>
                  <div class="custom-data-field-docs docs-container" data-source="token-headers" data-key\$="[[item.name]]"></div>
                </div>
              </template>
            </template>
            <template is="dom-if" if="[[tokenBody]]" restamp="">
              <h4>Token request body</h4>
              <template is="dom-repeat" items="{{tokenBody}}" data-repeater="token-body">
                <div class="custom-data-field body-parameter">
                  <div class="custom-data-field-value">
                    <api-property-form-item model="[[item]]" name\$="[[item.name]]" auto-validate="" required\$="[[item.required]]" value="{{item.value}}" data-type="token-body"></api-property-form-item>
                    <template is="dom-if" if="[[_computeHasDoc(noDocs, item.hasDescription)]]">
                      <paper-icon-button class="help-icon hint-icon" icon="arc:help" on-click="_toggleDocumentation" data-source="token-body" title="Display documentation" noink="[[noink]]"></paper-icon-button>
                    </template>
                  </div>
                  <div class="custom-data-field-docs docs-container" data-source="token-body" data-key\$="[[item.name]]"></div>
                </div>
              </template>
            </template>
            <template is="dom-if" if="[[isAdvanced]]">
              <div class="adv-toggle">
                <paper-checkbox class="adv-settings-input" checked="{{advancedOpened}}">Advanced settings</paper-checkbox>
              </div>
            </template>
            <iron-collapse opened="[[advancedOpened]]">
              <paper-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="authuri" label="Authorization URI" value="{{authorizationUri}}" hiddable="" data-visible="implicit authorization_code" disabled\$="[[_isFieldDisabled(isCustomGrant, grantType, 'implicit', 'authorization_code')]]" type="text" autocomplete="on" title="The authorization URL initializes the OAuth flow. If you don't know the authorization URL check your provider's documentation."></paper-input>
              <paper-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="tokenuri" label="Access token URI" value="{{accessTokenUri}}" hiddable="" data-visible="client_credentials authorization_code password" disabled\$="[[_isFieldDisabled(isCustomGrant, grantType, 'client_credentials', 'authorization_code', 'password')]]" type="text" autocomplete="on" title="The access token URL is used by server implementations to exchange access code for access token."></paper-input>
              <paper-masked-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="username" label="Username" value="{{username}}" hiddable="" data-visible="password" disabled\$="[[_isFieldDisabled(isCustomGrant, grantType, 'password')]]" autocomplete="on" title="The username required for this OAuth authentication."></paper-masked-input>
              <paper-masked-input auto-validate="" required\$="[[_isFieldRequired(isCustomGrant)]]" data-input="password" label="Password" value="{{password}}" hiddable="" data-visible="password" disabled\$="[[_isFieldDisabled(isCustomGrant, grantType, 'password')]]" autocomplete="on" title="The password required for this OAuth authentication."></paper-masked-input>
              <div>
                <oauth2-scope-selector allowed-scopes="[[allowedScopes]]" prevent-custom-scopes="[[preventCustomScopes]]" value="{{scopes}}"></oauth2-scope-selector>
              </div>
            </iron-collapse>
          </section>
        </auth-method-step>
        <auth-method-step step-start-index="[[stepStartIndex]]" step="3" no-steps="[[noSteps]]">
          <span slot="title">Redirect URI</span>
          <section>
            <div class="redirect-section">
              <p class="redirect-info">Set this redirect URI in OAuth 2.0 provider settings.</p>
              <p class="read-only-param-field padding">
                <span class="code" on-click="_clickCopyAction">[[redirectUri]]</span>
              </p>
            </div>
          </section>
        </auth-method-step>
      </form>
    </iron-form>
    <div class="authorize-actions" hidden\$="[[hasAccessToken]]">
      <paper-button disabled\$="[[_authorizing]]" class="auth-button" data-type="get-token" on-click="authorize" raised="" noink="[[noink]]">Request access token</paper-button>
      <paper-spinner active="[[_authorizing]]"></paper-spinner>
    </div>

    <div class="current-token" hidden\$="[[!hasAccessToken]]">
      <label class="token-label">Current token</label>
      <p class="read-only-param-field padding">
        <span class="code" on-click="_clickCopyAction">[[accessToken]]</span>
      </p>
      <div class="authorize-actions">
        <paper-button disabled\$="[[_authorizing]]" class="auth-button" data-type="refresh-token" on-click="authorize" raised="" noink="[[noink]]">Refresh access token</paper-button>
        <paper-spinner active="[[_authorizing]]"></paper-spinner>
      </div>
    </div>
    <paper-toast text="" duration="5000"></paper-toast>
    <paper-toast class="error-toast" text="" duration="5000"></paper-toast>
    <paper-toast text="Value copied to clipboard" id="clipboardToast" duration="2000"></paper-toast>
    <clipboard-copy></clipboard-copy>`;
  }
  static get is() {
    return 'auth-method-oauth2';
  }
  static get properties() {
    return {
      // Seleted authorization grand type.
      grantType: {
        type: String,
        value: '',
        notify: true,
        observer: '_settingsChanged'
      },
      /**
       * Computed value, true if the grant type is a cutom definition.
       */
      isCustomGrant: {
        type: Boolean,
        computed: '_computeIsCustomGrant(grantType)',
        value: false
      },
      // Computed value, true if the `grantType` is set.
      isSelectedType: {
        type: Boolean,
        value: false,
        computed: '_computeIsSelectedType(grantType)'
      },
      /**
       * If true, OAuth flow selector will be collapsed.
       */
      forceHideTypeSelector: {
        type: Boolean,
        value: false
      },
      // The client ID for the auth token.
      clientId: {
        type: String,
        notify: true,
        observer: '_clientIdChanged'
      },
      // The client secret. It to be used when selected server flow.
      clientSecret: {
        type: String,
        notify: true,
        observer: '_clientSecretChanged'
      },
      // The authorization URL to initialize the OAuth flow.
      authorizationUri: {
        type: String,
        notify: true,
        observer: '_authorizationUriChanged'
      },
      // The access token URL to exchange code for token. It is used in server flow.
      accessTokenUri: {
        type: String,
        notify: true,
        observer: '_accessTokenUriChanged'
      },
      // The password. To be used with the password flow.
      password: {
        type: String,
        notify: true,
        observer: '_passwordChanged'
      },
      // The password. To be used with the password flow.
      username: {
        type: String,
        notify: true,
        observer: '_usernameChanged'
      },
      /**
       * A callback URL to be used with this element.
       * User can't change the callback URL and it will inform the user to setup OAuth to use
       * this value.
       *
       * This is relevant when selected flow is the browser flow.
       */
      redirectUri: {
        type: String,
        observer: '_settingsChanged'
      },
      /**
       * List of user selected scopes.
       * It can be pre-populated with list of scopes (array of strings).
       */
      scopes: {
        type: Array
      },
      /**
       * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
       * element.
       */
      allowedScopes: Array,
      /**
       * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
       * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
       */
      preventCustomScopes: Boolean,
      // True when currently authorizing the user.
      _authorizing: Boolean,
      /**
       * When the user authorized the app it should be set to the token value.
       * This element do not perform authorization. Other elements must intercept
       * `oauth2-token-requested` and perform the authorization. As a result the element
       * performing an authorization should set back the auth token on the event target object
       * (this element).
       */
      accessToken: {
        type: String,
        observer: '_accessTokenChanged'
      },
      /**
       * Received from the response token value.
       * By default it is "bearer" as the only one defined in OAuth 2.0
       * spec.
       * If the token response contains `tokenType` property this value is
       * updated.
       */
      tokenType: {
        type: String,
        value: 'Bearer',
        observer: '_tokenTypeChanged'
      },
      // Computed value, true if access token is set.
      hasAccessToken: {
        type: Boolean,
        value: false,
        computed: '_computeHasToken(accessToken)',
      },
      /**
       * AMF json/ld mode describing security scheme.
       */
      amfSettings: {
        type: Object,
        observer: '_amfChanged'
      },

      // Currently available grant types.
      grantTypes: {
        type: Array,
        observer: '_settingsChanged'
      },
      /**
       * `true` whem the element has been initialized.
       * When changed it dispatches first oauth settings event with initial
       * values.
       */
      _initialized: {
        type: Boolean,
        observer: '_settingsChanged'
      },
      // If true, the flow type selector will be forced to be opened
      _typeSelectorForceOpened: {
        type: Boolean,
        value: false
      },
      /**
       * The element will automatically hide following fileds it the element has been initialized
       * with values for this fields (without user interaction):
       *
       * - autorization url
       * - token url
       * - scopes
       *
       * If all this values are set then the element will set `isAdvanced` attribute and set
       * `advancedOpened` to false
       *
       * Setting this property will prevent this behavior.
       */
      noAuto: Boolean,
      /**
       * If set it will render autorization url, token url and scopes as advanced options
       * activated on user interaction.
       */
      isAdvanced: Boolean,
      /**
       * If true then the advanced options are opened.
       */
      advancedOpened: Boolean,
      /**
       * If set, the grant typr selector will be hidden from the UI.
       */
      noGrantType: {
        type: Boolean,
        observer: '_noGrantTypeChanged'
      },
      /**
       * List of query parameters to apply to authorization request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      authQueryParameters: {
        type: Array,
        readOnly: true
      },
      /**
       * List of query parameters to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      tokenQueryParameters: {
        type: Array,
        readOnly: true
      },
      /**
       * List of headers to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      tokenHeaders: {
        type: Array,
        readOnly: true
      },
      /**
       * List of body parameters to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      tokenBody: {
        type: Array,
        readOnly: true
      },
      /**
       * Default delivery method of access token. Reported with
       * settings change event as `deliveryMethod`.
       *
       * This value is added to event's `settings` property.
       *
       * When setting AMF model, this value may change, if AMF description
       * forces different than default placement of the token.
       */
      oauthDeliveryMethod: {
        type: String,
        value: 'header'
      },
      /**
       * Default parameter name that carries access token. Reported with
       * the settings change event as `deliveryName`.
       *
       * This value is added to event's `settings` property.
       *
       * When setting AMF model, this value may change, if AMF description
       * forces different than default parameter name for the token.
       */
      oauthDeliveryName: {
        type: String,
        value: 'authorization'
      },
      /**
       * Renders slightly different view that is optymized for mobile
       * or narrow area on desktop.
       */
      narrow: {
        type: Boolean,
        reflectToAttribute: true
      }
    };
  }

  static get observers() {
    return [
      '_updateStepperState(noSteps)',
      '_settingsChanged(scopes.*)',
      '_settingsChanged(tokenBody.*)',
      '_settingsChanged(tokenHeaders.*)',
      '_settingsChanged(tokenQueryParameters.*)',
      '_settingsChanged(authQueryParameters.*)'
    ];
  }

  get _queryModelOpts() {
    return {
      valueDelimiter: '=',
      decodeValues: true
    };
  }

  get _headersModelOpts() {
    return {
      valueDelimiter: ':'
    };
  }

  /**
   * List of OAuth 2.0 grants.
   * This list can be extended by custom grants
   * @return {Array<Object>} List of objects with `type` and `label`
   * properties.
   */
  get _oauth2GrantTypes() {
    return [{
      type: 'implicit',
      label: 'Access token (browser flow)'
    }, {
      type: 'authorization_code',
      label: 'Authorization code (server flow)'
    }, {
      type: 'client_credentials',
      label: 'Client credentials'
    }, {
      type: 'password',
      label: 'Password'
    }];
  }

  constructor() {
    super();
    this._oauth2ErrorHandler = this._oauth2ErrorHandler.bind(this);
    this._tokenSuccessHandler = this._tokenSuccessHandler.bind(this);
    this._headerChangedHandler = this._headerChangedHandler.bind(this);
  }

  ready() {
    super.ready();
    this._initialized = true;
    afterNextRender(this, () => {
      if (!this.grantTypes) {
        this._updateGrantTypes();
      }
      this._autoHide();
      this._autoRestore();
    });
  }

  _attachListeners(node) {
    window.addEventListener('oauth2-error', this._oauth2ErrorHandler);
    window.addEventListener('oauth2-token-response', this._tokenSuccessHandler);
    node.addEventListener('request-header-changed', this._headerChangedHandler);
  }

  _detachListeners(node) {
    window.removeEventListener('oauth2-error', this._oauth2ErrorHandler);
    window.removeEventListener('oauth2-token-response', this._tokenSuccessHandler);
    node.removeEventListener('request-header-changed', this._headerChangedHandler);
  }
  /**
   * This function hides all non-crucial fields that has been pre-filled when element has been
   * initialize (values not provided by the user). Hidden fields will be available under
   * "advanced" options.
   *
   * To prevent this behavior set `no-auto` attribute on this element.
   */
  _autoHide() {
    if (this.noAuto) {
      this.advancedOpened = true;
      return;
    }
    if (!!this.authorizationUri && !!this.accessTokenUri && !!(this.scopes && this.scopes.length)) {
      this.isAdvanced = true;
      this.advancedOpened = false;
    } else {
      this.advancedOpened = true;
    }
  }

  get storeKeys() {
    return {
      clientId: 'auth.methods.latest.client_id',
      secret: 'auth.methods.latest.client_secret',
      token: 'auth.methods.latest.auth_token',
      authUri: 'auth.methods.latest.auth_uri',
      tokenUri: 'auth.methods.latest.auth_uri',
      username: 'auth.methods.latest.username',
      password: 'auth.methods.latest.password',
      tokenType: 'auth.methods.latest.tokenType'
    };
  }
  /**
   * Automatically restores value from session store if any exists.
   * It does not override values already set.
   */
  _autoRestore() {
    const keys = this.storeKeys;
    this._restoreSessionProperty(keys.clientId, 'clientId');
    this._restoreSessionProperty(keys.token, 'accessToken');
    this._restoreSessionProperty(keys.tokenType, 'tokenType');
    this._restoreSessionProperty(keys.authUri, 'authorizationUri');
    this._restoreSessionProperty(keys.tokenUri, 'accessTokenUri');
    this._restoreSessionProperty(keys.secret, 'clientSecret');
    this._restoreSessionProperty(keys.username, 'username');
    this._restoreSessionProperty(keys.password, 'password');
    if (!this.clientId) {
      this._restoreMetaClientId();
    }
    if (!this.clientSecret) {
      this._restoreMetaClientSecret();
    }
  }
  /**
   * Restores an item from a session store and assigns it to a local
   * property.
   * @param {String} sessionKey Session storage key
   * @param {String} localKey This component's property
   */
  _restoreSessionProperty(sessionKey, localKey) {
    if (!this[localKey]) {
      const value = sessionStorage.getItem(sessionKey);
      if (value) {
        this.set(localKey, value);
      }
    }
  }
  /**
   * Stores a property in a session storage.
   * @param {String} sessionKey A storage key
   * @param {String} value Value to store
   */
  _storeSessionProperty(sessionKey, value) {
    if (!value) {
      return;
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    sessionStorage.setItem(sessionKey, value);
  }
  /**
   * Sets `clientId` property from `iron-meta` if created.
   * The key for the meta is `oauth2-client-id`
   */
  _restoreMetaClientId() {
    const meta = document.createElement('iron-meta').byKey('oauth2-client-id');
    if (!meta) {
      return;
    }
    this.clientId = meta;
  }
  /**
   * Sets `clientSecret` property from `iron-meta` if created.
   * The key for the meta is `oauth2-client-secret`
   */
  _restoreMetaClientSecret() {
    const meta = document.createElement('iron-meta').byKey('oauth2-client-secret');
    if (!meta) {
      return;
    }
    this.clientSecret = meta;
  }
  /**
   * Validates the form.
   *
   * @return {Boolean} `true` if valid, `false` otherwise.
   */
  validate() {
    const form = this.shadowRoot.querySelector('iron-form');
    return form.validate();
  }

  _clientIdChanged(value) {
    this._storeSessionProperty(this.storeKeys.clientId, value);
    this._settingsChanged();
  }

  _clientSecretChanged(value) {
    this._storeSessionProperty(this.storeKeys.secret, value);
    this._settingsChanged();
  }

  _authorizationUriChanged(value) {
    this._storeSessionProperty(this.storeKeys.authUri, value);
    this._settingsChanged();
  }

  _accessTokenUriChanged(value) {
    this._storeSessionProperty(this.storeKeys.tokenUri, value);
    this._settingsChanged();
  }

  _passwordChanged(value) {
    this._storeSessionProperty(this.storeKeys.username, value);
    this._settingsChanged();
  }

  _usernameChanged(value) {
    this._storeSessionProperty(this.storeKeys.username, value);
    this._settingsChanged();
  }

  _accessTokenChanged(value) {
    this._storeSessionProperty(this.storeKeys.token, value);
    this._settingsChanged();
  }

  _tokenTypeChanged(value) {
    this._storeSessionProperty(this.storeKeys.tokenType, value);
  }

  _settingsChanged() {
    if (!this.shadowRoot || this.__cancelChangeEvent || !this._initialized) {
      return;
    }
    this._notifySettingsChange('oauth2');
  }

  // Checks if the HTML element should be visible in the UI for given properties.
  _isFieldDisabled() {
    const args = Array.from(arguments);
    const isCustom = args.splice(0, 1)[0];
    if (isCustom) {
      return false;
    }
    const grantType = args.splice(0, 1)[0];
    return args.indexOf(grantType) === -1;
  }
  /**
   * Computes the `required` attribute on input fileld.
   * When using custom grant type all fields are not required.
   *
   * @param {Boolean} isCustomGrant
   * @return {Boolean}
   */
  _isFieldRequired(isCustomGrant) {
    return !isCustomGrant;
  }
  /**
   * Dispatches the `oauth2-token-requested` event.
   * The event is handled by `oauth-authorization` component.
   *
   * If your application has own OAuth2 token exchange system then
   * handle the event and authorize the user.
   *
   * @return {Boolean} True if event was sent. Can be false if event is not
   * handled or when the form is invalid.
   */
  authorize() {
    const validationResult = this.validate();
    if (!validationResult) {
      this._errorToast('Authorization form is not valid.');
      return false;
    }
    const detail = this.getSettings();
    this._lastState = this.generateState();
    detail.state = this._lastState;
    this._authorizing = true;
    const e = new CustomEvent('oauth2-token-requested', {
      detail: detail,
      bubbles: true,
      composed: true,
      cancelable: true
    });
    this.dispatchEvent(e);
    this._analyticsEvent('auth-method-oauth2', 'usage-authorize', 'requested');
    if (!e.defaultPrevented) {
      this._errorToast('The application did not handled token request correctly.');
      this._authorizing = false;
      return false;
    }
    return true;
  }
  /**
   * Displays an error message in error toast
   * @param {String} message Message to display.
   */
  _errorToast(message) {
    const toast = this.shadowRoot.querySelector('paper-toast.error-toast');
    toast.text = message;
    toast.opened = true;
  }

  /**
   * Generates `state` parameter for the OAuth2 call.
   *
   * @return {String} Generated state string.
   */
  generateState() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Returns current configuration of the OAuth2.
   *
   * @return {Object} Current OAuth2 configuration.
   */
  getSettings() {
    const detail = {
      type: this.grantType,
      clientId: this.clientId,
      accessToken: this.accessToken || '',
      tokenType: this.tokenType,
      scopes: this.scopes,
      customData: {
        auth: {},
        token: {}
      },
      deliveryMethod: this.oauthDeliveryMethod,
      deliveryName: this.oauthDeliveryName
    };
    switch (this.grantType) {
      case 'implicit':
        // The browser flow.
        detail.authorizationUri = this.authorizationUri;
        detail.redirectUri = this.redirectUri;
        this._computeAuthCustomData(detail);
        delete detail.customData.token;
        break;
      case 'authorization_code':
        // The server flow.
        detail.authorizationUri = this.authorizationUri;
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = this.accessTokenUri;
        detail.redirectUri = this.redirectUri;
        this._computeAuthCustomData(detail);
        this._computeTokenCustomData(detail);
        break;
      case 'client_credentials':
        // The server flow.
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = this.accessTokenUri;
        this._computeTokenCustomData(detail);
        delete detail.customData.auth;
        break;
      case 'password':
        // The server flow.
        detail.username = this.username;
        detail.password = this.password;
        detail.accessTokenUri = this.accessTokenUri;
        this._computeTokenCustomData(detail);
        delete detail.customData.auth;
        break;
      default:
        // Custom grant type.
        detail.authorizationUri = this.authorizationUri;
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = this.accessTokenUri;
        detail.redirectUri = this.redirectUri;
        detail.username = this.username;
        detail.password = this.password;
        this._computeAuthCustomData(detail);
        this._computeTokenCustomData(detail);
        break;
    }
    return detail;
  }
  /**
   * Adds `customData` property values that can be applied to the
   * authorization request.
   *
   * @param {Object} detail Token request detail object. The object is passed
   * by reference so no need for return value
   */
  _computeAuthCustomData(detail) {
    if (this.authQueryParameters) {
      detail.customData.auth.parameters =
      this._computeCustomParameters(this.authQueryParameters);
    }
  }
  /**
   * Adds `customData` property values that can be applied to the
   * token request.
   *
   * @param {Object} detail Token request detail object. The object is passed
   * by reference so no need for return value
   */
  _computeTokenCustomData(detail) {
    if (this.tokenQueryParameters) {
      detail.customData.token.parameters =
        this._computeCustomParameters(this.tokenQueryParameters);
    }
    if (this.tokenHeaders) {
      detail.customData.token.headers =
        this._computeCustomParameters(this.tokenHeaders);
    }
    if (this.tokenBody) {
      detail.customData.token.body =
        this._computeCustomParameters(this.tokenBody);
    }
  }
  /**
   * Computes list of parameter values from current model.
   *
   * This function ignores empty values if they are not required.
   * Required property are always included, even if the value is not set.
   *
   * @param {Array} params Model for form inputs.
   * @return {Array|undefined} Array of objects with `name` and `value`
   * properties or undefined if `params` is empty or no values are available.
   */
  _computeCustomParameters(params) {
    if (!params || !params.length) {
      return;
    }
    const result = [];
    params.forEach((item) => {
      const value = item.value;
      if (!item.required) {
        const type = typeof value;
        if (type === 'number') {
          if (!value && value !== 0) {
            return;
          }
        } else if (type === 'string') {
          if (!value) {
            return;
          }
        } else if (value instanceof Array) {
          if (!value[0]) {
            return;
          }
        } else if (type === 'undefined') {
          return;
        }
      }
      result.push({
        name: item.name,
        value: item.value || ''
      });
    });
    if (result.length === 0) {
      return;
    }
    return result;
  }
  /**
   * Restores settings from stored value.
   *
   * @param {Object} settings Object returned by `getSettings()`
   */
  restore(settings) {
    this.grantType = settings.type;
    this.clientId = settings.clientId;
    this.accessToken = settings.accessToken;
    this.scopes = settings.scopes;
    switch (this.grantType) {
      case 'implicit':
        this.authorizationUri = settings.authorizationUri;
        break;
      case 'authorization_code':
        this.authorizationUri = settings.authorizationUri;
        this.clientSecret = settings.clientSecret;
        this.accessTokenUri = settings.accessTokenUri;
        break;
      case 'client_credentials':
        // The server flow.
        this.clientSecret = settings.clientSecret;
        this.accessTokenUri = settings.accessTokenUri;
        break;
      case 'password':
        // The server flow.
        this.username = settings.username;
        this.password = settings.password;
        this.accessTokenUri = settings.accessTokenUri;
        break;
    }
  }

  /**
   * Computes value for `hasAccessToken` property
   * @param {String} newValue Token changed value
   * @return {Boolean}
   */
  _computeHasToken(newValue) {
    return !!(newValue);
  }
  /**
   * Handler for `oauth2-error` custom event.
   * Informs the user about the error in the flow if the state property
   * is the one used with the request.
   *
   * @param {CustomEvent} e
   */
  _oauth2ErrorHandler(e) {
    const info = e.detail;
    // API console may not support state check (may not return it back)
    if (typeof info.state !== 'undefined') {
      if (info.state !== this._lastState) {
        return;
      }
    }
    this._authorizing = false;
    this._lastState = undefined;
    this._errorToast(info.message);
    this._analyticsEvent('auth-method-oauth2', 'usage-authorize', 'failure');
  }
  /**
   * Handler for the token response from the authorization component.
   *
   * @param {CustomEvent} e
   */
  _tokenSuccessHandler(e) {
    const info = e.detail;
    // API console may not support state check (mey not return it back)
    if (typeof info.state !== 'undefined') {
      if (info.state !== this._lastState) {
        return;
      }
    }
    this._authorizing = false;
    this._lastState = undefined;
    if (info.accessToken && info.accessToken !== this.accessToken) {
      if (info.tokenType && info.tokenType !== this.tokenType) {
        this.tokenType = info.tokenType;
      } else if (!info.tokenType && this.tokenType !== 'Bearer') {
        this.tokenType = 'Bearer';
      }
      this.set('accessToken', info.accessToken);
      this.dispatchEvent(new CustomEvent('oauth2-token-ready', {
        detail: {
          token: info.accessToken,
          tokenType: this.tokenType
        },
        bubbles: true,
        composed: true
      }));
    }
    this._analyticsEvent('auth-method-oauth2', 'usage-authorize', 'success');
  }
  /**
   * Handler to set up data from the AMF model.
   *
   * @param {Object} model Security model of AMF
   */
  _amfChanged(model) {
    const prefix = this.ns.raml.vocabularies.security;
    if (!this._hasType(model, prefix + 'ParametrizedSecurityScheme')) {
      this._setupOAuthDeliveryMethod();
      this._updateGrantTypes();
      return;
    }
    const shKey = this._getAmfKey(prefix + 'scheme');
    let scheme = model[shKey];
    let type;
    if (scheme) {
      if (scheme instanceof Array) {
        scheme = scheme[0];
      }
      type = this._getValue(scheme, prefix + 'type');
    }
    const isOauth2 = type === 'OAuth 2.0';
    if (!isOauth2) {
      this._setupOAuthDeliveryMethod();
      this._updateGrantTypes();
      return;
    }
    this._setupOAuthDeliveryMethod(scheme);
    const sKey = this._getAmfKey(this.ns.raml.vocabularies.security + 'settings');
    let settings = scheme[sKey];
    if (settings instanceof Array) {
      settings = settings[0];
    }
    this._clearDocs();
    this.__cancelChangeEvent = true;
    this._preFillAmfData(settings);
    this.__cancelChangeEvent = false;
    this._autoHide();
    // The form is not yet ready to be validated. When it's rendered then
    // notify settings change
    afterNextRender(this, () => {
      this._settingsChanged();
    });
  }

  _setupOAuthDeliveryMethod(model) {
    const info = this._getOauth2DeliveryMethod(model);
    if (this.oauthDeliveryMethod !== info.method) {
      this.oauthDeliveryMethod = info.method;
    }
    if (this.oauthDeliveryName !== info.name) {
      this.oauthDeliveryName = info.name;
    }
  }
  /**
   * Determines placemenet of OAuth authorization token location.
   * It can be either query parameter or header. This function
   * reads API spec to get this information or provides default if
   * not specifies.
   *
   * @param {Object} info Security AMF model
   * @return {Object}
   */
  _getOauth2DeliveryMethod(info) {
    const result = {
      method: 'header',
      name: 'authorization'
    };
    if (!info) {
      return result;
    }
    const http = this.ns.raml.vocabularies.http;
    const hKey = this._getAmfKey(http + 'header');
    const pKey = this._getAmfKey(http + 'parameter');
    const nKey = this._getAmfKey(this.ns.schema.schemaName);
    let header = info[hKey];
    if (header instanceof Array) {
      header = header[0];
    }
    if (header) {
      const headerName = this._getValue(header, nKey);
      if (headerName) {
        result.name = headerName;
        return result;
      }
    }
    let parameter = info[pKey];
    if (parameter instanceof Array) {
      parameter = parameter[0];
    }
    if (parameter) {
      const paramName = this._getValue(parameter, nKey);
      if (paramName) {
        result.name = paramName;
        result.method = 'query';
        return result;
      }
    }
    return result;
  }
  /**
   * Reads API security definition and applies itn to the view as predefined
   * values.
   *
   * @param {Object} model AMF model describing settings of the security
   * scheme
   */
  _preFillAmfData(model) {
    if (!model) {
      throw new Error('The `settings` argument is not set.');
    }
    const sec = this.ns.raml.vocabularies.security;
    if (!this._hasType(model, sec + 'OAuth2Settings')) {
      console.warn('Passed model does not represent OAuth 2.0 Settings');
      return;
    }
    this.authorizationUri = this._getValue(model, sec + 'authorizationUri') || '';
    this.accessTokenUri = this._getValue(model, sec + 'accessTokenUri') || '';
    this.scopes = this._redSecurityScopes(model[this._getAmfKey(sec + 'scope')]);
    const apiGrants = this._getValueArray(model, sec + 'authorizationGrant');
    const annotationKey = this._amfCustomSettingsKey(model);
    const annotation = annotationKey ? model[annotationKey] : undefined;
    const grants = this._applyAnnotationGranst(apiGrants, annotation);
    if (grants && grants instanceof Array && grants.length) {
      const index = grants.indexOf('code');
      if (index !== -1) {
        grants[index] = 'authorization_code';
      }
      this._updateGrantTypes(grants);
    } else {
      this._updateGrantTypes();
    }
    this._setupAnotationParameters(annotation);
  }
  /**
   * Extracts scopes list from the security definition
   * @param {Array} model
   * @return {Array<String>|undefined}
   */
  _redSecurityScopes(model) {
    model = this._ensureArray(model);
    if (!model) {
      return;
    }
    const result = [];
    for (let i = 0, len = model.length; i < len; i++) {
      const value = this._getValue(model[i], this.ns.raml.vocabularies.security + 'name');
      if (!value) {
        continue;
      }
      result.push(value);
    }
    return result;
  }
  /**
   * Finds a key for Custom settings
   * @param {Object} model Security scheme settings object.
   * @return {String|undefined}
   */
  _amfCustomSettingsKey(model) {
    const keys = Object.keys(model);
    const data = this.ns.raml.vocabularies.data;
    const settingsKeys = [
      this._getAmfKey(data + 'authorizationSettings'),
      this._getAmfKey(data + 'authorizationGrants'),
      this._getAmfKey(data + 'accessTokenSettings')
    ];
    for (let i = 0; i < keys.length; i++) {
      const node = model[keys[i]];
      if (node[settingsKeys[0]] || node[settingsKeys[1]] || node[settingsKeys[2]]) {
        return keys[i];
      }
    }
  }
  /**
   * Applies `authorizationGrants` from OAuth2 settings annotation.
   *
   * @param {Array} gransts OAuth spec grants available for the endpoint
   * @param {?Object} annotation Read annotation.
   * @return {Array} List of granst to apply.
   */
  _applyAnnotationGranst(gransts, annotation) {
    if (!annotation) {
      return gransts;
    }
    if (!gransts) {
      gransts = [];
    }
    const d = this.ns.raml.vocabularies.data;
    let model = annotation[this._getAmfKey(d + 'authorizationGrants')];
    model = this._ensureArray(model);
    if (!model || !model.length) {
      return gransts;
    }
    const list = model[0][this._getAmfKey(this.ns.w3.name + '1999/02/22-rdf-syntax-ns#member')];
    const addedGrants = [];
    list.forEach((item) => {
      const v = this._getValue(item, d + 'value');
      if (!v) {
        return;
      }
      addedGrants.push(v);
    });
    if (!addedGrants.length) {
      return gransts;
    }
    const ignoreKey = d + 'ignoreDefaultGrants';
    if (typeof annotation[ignoreKey] !== 'undefined') {
      gransts = [];
    }
    gransts = gransts.concat(addedGrants);
    return gransts;
  }
  /**
   * Sets up annotation supported variables to apply form view for:
   * - authorization query parameters
   * - authorization headers
   * - token query parameters
   * - token headers
   * - token body
   *
   * @param {Object} annotation Annotation applied to the OAuth settings
   */
  _setupAnotationParameters(annotation) {
    if (this.authQueryParameters) {
      this._setAuthQueryParameters(undefined);
    }
    if (this.tokenQueryParameters) {
      this._setTokenQueryParameters(undefined);
    }
    if (this.tokenHeaders) {
      this._setTokenHeaders(undefined);
    }
    if (this.tokenBody) {
      this._setTokenBody(undefined);
    }
    if (!annotation) {
      return;
    }
    const d = this.ns.raml.vocabularies.data;
    const qpKey = this._getAmfKey(d + 'queryParameters');
    let authSettings = annotation[this._getAmfKey(d + 'authorizationSettings')];
    let tokenSettings = annotation[this._getAmfKey(d + 'accessTokenSettings')];
    if (authSettings) {
      if (authSettings instanceof Array) {
        authSettings = authSettings[0];
      }
      const qp = authSettings[qpKey];
      if (qp) {
        this._setupAuthRequestQueryParameters(qp);
      }
    }
    if (tokenSettings) {
      if (tokenSettings instanceof Array) {
        tokenSettings = tokenSettings[0];
      }
      const qp = tokenSettings[qpKey];
      const headers = tokenSettings[this._getAmfKey(d + 'headers')];
      const body = tokenSettings[this._getAmfKey(d + 'body')];
      if (qp) {
        this._setupTokenRequestQueryParameters(qp);
      }
      if (headers) {
        this._setupTokenRequestHeaders(headers);
      }
      if (body) {
        this._setupTokenRequestBody(body);
      }
    }
  }
  /**
   * Sets up query parameters to be used with authorization request.
   *
   * @param {Array} params List of parameters from the annotation.
   */
  _setupAuthRequestQueryParameters(params) {
    const model = this._createViewModel(params, this._queryModelOpts);
    if (!model) {
      return;
    }
    this._setAuthQueryParameters(model);
  }
  /**
   * Sets up query parameters to be used with token request.
   *
   * @param {Array} params List of parameters from the annotation.
   */
  _setupTokenRequestQueryParameters(params) {
    const model = this._createViewModel(params, this._queryModelOpts);
    if (!model) {
      return;
    }
    this._setTokenQueryParameters(model);
  }
  /**
   * Sets up headers to be used with token request.
   *
   * @param {Array} params List of parameters from the annotation.
   */
  _setupTokenRequestHeaders(params) {
    const model = this._createViewModel(params, this._headersModelOpts);
    if (!model) {
      return;
    }
    this._setTokenHeaders(model);
  }
  /**
   * Sets up body parameters to be used with token request.
   *
   * @param {Array} params List of parameters from the annotation.
   */
  _setupTokenRequestBody(params) {
    const model = this._createViewModel(params, this._queryModelOpts);
    if (!model) {
      return;
    }
    this._setTokenBody(model);
  }
  /**
   * Creats a form view model for type items.
   *
   * @param {Array|object} param Property or list of properties to process.
   * @param {Object} modelOptions
   * @return {Array|undefined} Form view model or undefined if not set.
   */
  _createViewModel(param, modelOptions) {
    if (!param) {
      return;
    }
    if (param instanceof Array) {
      param = param[0];
    }
    const factory = document.createElement('api-view-model-transformer');
    factory.amfModel = this.amfModel;
    return factory.modelForRawObject(param, modelOptions);
  }
  /**
   * Computes value of `isCustomGrant` property when `grantType` changes.
   *
   * @param {String} grantType Selected grant type.
   * @return {Boolean} `true` if the `grantType` is none of the ones defined
   * by the OAuth 2.0 spec.
   */
  _computeIsCustomGrant(grantType) {
    return ['implicit', 'authorization_code', 'client_credentials', 'password']
      .indexOf(grantType) === -1;
  }
  /**
   * Updates list of OAuth grant types supported by current endpoint.
   * The information should be available in RAML file.
   *
   * @param {Array<String>?} supportedTypes List of supported types. If empty
   * or not set then all available types will be displayed.
   */
  _updateGrantTypes(supportedTypes) {
    const available = this._computeGrantList(supportedTypes);
    this.set('grantTypes', available);
    // check if current selection is still available
    const current = this.grantType;
    const hasCurrent = current ?
      available.some((item) => item.type === current) : false;
    if (!hasCurrent) {
      if (available && available[0]) {
        this.set('grantType', available[0].type);
      } else {
        this.set('grantType', '');
      }
    } else if (available.length === 1) {
      this.set('grantType', available[0].type);
    }
  }
  /**
   * Computes list of grant types to render in the form.
   *
   * @param {?Array<String>} allowed List of types allowed by the
   * component configuration or API spec applied to this element. If empty
   * or not set then all OAuth 2.0 default types are returned.
   * @return {Array<Object>}
   */
  _computeGrantList(allowed) {
    let defaults = this._oauth2GrantTypes;
    if (!allowed || !allowed.length) {
      return defaults;
    }
    allowed = Array.from(allowed);
    for (let i = defaults.length - 1; i >= 0; i--) {
      const index = allowed.indexOf(defaults[i].type);
      if (index === -1) {
        defaults.splice(i, 1);
      } else {
        allowed.splice(index, 1);
      }
    }
    if (allowed.length) {
      allowed = allowed.map(function(item) {
        return {
          label: item,
          type: item
        };
      });
      defaults = defaults.concat(allowed);
    }
    return defaults;
  }
  /**
   * Computes boolean value for `isSelectedType` if `grantType` is set.
   *
   * @param {String} grantType Current grant type.
   * @return {Boolean} True when the value is set.
   */
  _computeIsSelectedType(grantType) {
    return !!grantType;
  }
  /**
   * Clears grant type selection.
   */
  _clearTypeSelection() {
    this.grantType = '';
  }
  /**
   * Computes the label for selected step title.
   *
   * @param {String} grantType Selected grant type.
   * @return {String} Label to render
   */
  _computeSelectedTypeLabel(grantType) {
    switch (grantType) {
      case 'implicit':
        return 'Access token (browser flow)';
      case 'authorization_code':
        return 'Authorization code (server flow)';
      case 'client_credentials':
        return 'Client credentials';
      case 'password':
        return 'Password';
      default:
        if (!this.grantTypes) {
          return '';
        }
        const item = this.grantTypes.find((item) => item.type === grantType);
        return item ? item.label : 'Custom grant';
    }
  }

  _updateStepperState(noStepper) {
    this._typeSelectorForceOpened = noStepper ? true : false; // can be undefined
  }

  _noGrantTypeChanged(newValue, oldValue) {
    if (newValue) {
      this.stepStartIndex--;
    } else if (oldValue !== undefined) {
      this.stepStartIndex++;
    }
  }

  /**
   * Handler for the `request-header-changed` custom event.
   * If the panel is opened the it checks if current header updates
   * authorization.
   *
   * @param {Event} e
   */
  _headerChangedHandler(e) {
    if (e.defaultPrevented || e.target === this) {
      return;
    }
    let name = e.detail.name;
    if (!name) {
      return;
    }
    name = name.toLowerCase();
    if (name !== 'authorization') {
      return;
    }
    let value = e.detail.value;
    if (!value) {
      if (this.accessToken) {
        this.set('accessToken', '');
      }
      return;
    }
    const lowerValue = value.toLowerCase();
    const lowerType = (this.tokenType || 'bearer').toLowerCase();
    if (lowerValue.indexOf(lowerType) !== 0) {
      if (this.accessToken) {
        this.set('accessToken', '');
      }
      return;
    }
    value = value.substr(7);
    this.set('accessToken', value);
  }
  /**
   * Toggles documentartion for custom property.
   *
   * @param {CustomEvent} e
   */
  _toggleDocumentation(e) {
    const target = e.target;
    const source = target.dataset.source;
    if (!source) {
      throw new Error('Could not find source of the event.');
    }
    const repeater = this.shadowRoot.querySelector('[data-repeater="' + source + '"]');
    if (!repeater) {
      throw new Error('Could not find repeater for the item.');
    }
    const model = repeater.modelForElement(target).get('item');
    let selector = '.custom-data-field-docs[data-source="' + source + '"]';
    selector += '[data-key="' + model.name + '"]';
    const docsContainer = this.shadowRoot.querySelector(selector);
    if (!docsContainer) {
      throw new Error('Could not find documentation container.');
    }
    if (!docsContainer.children[0]) {
      this._createDocsElements(model, docsContainer);
    } else {
      docsContainer.children[0].opened = !docsContainer.children[0].opened;
    }
  }
  /**
   * Creates a documentation element.
   *
   * @param {Object} model
   * @param {Element} appendTo
   */
  _createDocsElements(model, appendTo) {
    const collapse = document.createElement('iron-collapse');
    const marked = document.createElement('marked-element');
    const wrapper = document.createElement('div');

    collapse.dataset.docsCollapse = true;
    wrapper.className = 'markdown-body';
    wrapper.slot = 'markdown-html';
    marked.appendChild(wrapper);
    collapse.appendChild(marked);
    appendTo.appendChild(collapse);

    marked.markdown = model.description;
    afterNextRender(this, () => {
      collapse.opened = true;
    });
  }
  /**
   * Clears all custom data documention nodes.
   */
  _clearDocs() {
    const nodes = this.shadowRoot.querySelectorAll('[data-docs-collapse="true"]');
    if (!nodes || !nodes.length) {
      return;
    }
    nodes.forEach((node) => node.parentNode.removeChild(node));
  }

  /**
   * Dispatches analytics event.
   *
   * @param {String} category Event category
   * @param {String} action Event action
   * @param {String} label Event label
   */
  _analyticsEvent(category, action, label) {
    const e = new CustomEvent('send-analytics', {
      detail: {
        type: 'event',
        category: category,
        action: action,
        label: label
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(e);
  }
  /**
   * A handler for `focus` event on a label that contains text and
   * should be coppied to clipboard when user is interacting with it.
   *
   * @param {ClickEvent} e
   */
  _clickCopyAction(e) {
    const node = e.target;
    const elm = this.shadowRoot.querySelector('clipboard-copy');
    elm.content = node.innerText;
    if (elm.copy()) {
      this.$.clipboardToast.opened = true;
    }
    afterNextRender(this, () => {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
      } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }
  /**
   * Fired when user requested to perform an authorization.
   * The details object vary depends on the `grantType` property.
   * However this event always fire two properties set on the `detail` object: `type` and
   * `clientId`.
   *
   * @event oauth2-token-requested
   * @param {String} type The type of grant option selected by the user. `implicit` is
   * the browser flow where token ir requested. `authorization_code` or server flow is where
   * client asks for the authorization code and exchange it later for the auth token using
   * client secret. Other options are `password` and `client_credentials`.
   * @param {String} clientId Every type requires `clientId`.
   * @param {String} authorizationUri Token authorization URL. Used in `implicit` and
   * `authorization_code` types. In both cases means the initial endpoint to request for token
   * or the authorization code.
   * @param {Array<String>} scopes A list of scopes seleted by the user. Used in `implicit`
   * and `authorization_code` types.
   * @param {String} redirectUri A redirect URL of the client after authorization (or error).
   * This must be set in the provider's OAuth settings. Callback URL must communicate with
   * the app to pass the information back to the application. User can't change the `redirectUri`
   * but the app shouldn't rely on this value since in browser environment it is possible to
   * temper with variables. The `redirectUri` must be set to this element by owner app (which
   * must know this value). A `redirectUri` is set for `implicit` and `authorization_code`
   * types.
   * @param {String} clientSecret The client secret that user can get from the OAuth provider
   * settings console. User in `authorization_code` and `client_credentials` types.
   * @param {String} accessTokenUri An URL to exchange code for the access token. Used by
   * `authorization_code`, `client_credentials` and `password` types.
   * @param {String} username Used with `password` type.
   * @param {String} password Used with `password` type.
   * @param {Object} customData Custom query parameters, headers and body applied
   * to the authorization or token request. See this element description for details.
   * @param {String} deliveryMethod Access token location in the request.
   * It can be either `header` or `query`. Defaults to header.
   * @param {String} deliveryName Name of the parmater to use to transport
   * the token. By default it is `authorization` for header value.
   */
  /**
   * Fired when the any of the auth method settings has changed.
   * This event will be fired quite frequently - each time anything in the text field changed.
   * With one exception. This event will not be fired if the validation of the form didn't passed.
   *
   * This event will set current settings as a detail object which are the same as for the
   * `oauth2-token-requested` event. Additionally it will contain a `accessToken` property. This
   * valye can be `undefined` if token hasn't been requested yet by the user.
   * Clients should support a situaltion when the user do not request the token before requesting
   * the resource and perform authorization.
   *
   * @event auth-settings-changed
   * @param {Object} settings See the `oauth2-token-requested` for detailed
   * description
   * @param {String} type The authentication type selected by the user.
   * @param {Boolean} valid True if the form has been validated.
   */
  /**
   * Fired when the request token has been obtained and it's ready to serve.
   * Because only one auth panel can be displayed ad a time it can be assumed
   * that if new token has been obtained then it is current authorization
   * method.
   *
   * @event oauth2-token-ready
   * @param {String} token The OAuth 2.0 token
   * @param {String} tokenType Token type reported by the server.
   */
}
window.customElements.define(AuthMethodOauth2.is, AuthMethodOauth2);