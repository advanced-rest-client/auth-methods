/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
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
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {AuthMethodsMixin} from './auth-methods-mixin.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@advanced-rest-client/paper-masked-input/paper-masked-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/iron-form/iron-form.js';
import './auth-methods-styles.js';
import './auth-method-step.js';
/**
 * The `<auth-method-basic>` element displays a form to provide the Basic
 * auth credentials.
 * It calculates base64 has while typing into username or password field.
 *
 * It accepts `hash` as a property and once set it will atempt to decode it
 * and set username and paswword.
 *
 * ### Example
 *
 * ```html
 * <auth-method-basic hash="dGVzdDp0ZXN0"></auth-method-basic>
 * ```
 *
 * This example will produce a form with prefilled username and passowrd with
 * value "test".
 *
 * ## Changes in version 2.0
 *
 * - Removed `OpendablePanelBehavior`. The element will always react to headers
 * change event
 *
 * ### Styling
 *
 * `<auth-methods>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--auth-method-basic` | Mixin applied to the element. | `{}`
 * `--auth-method-panel` | Mixin applied to all auth elements. | `{}`
 *
 * This is very basic element. Style inputs using `paper-input`'s or `
 * paper-toggle`'s css variables.
 *
 * @customElement
 * @polymer
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 * @appliesMixin AuthMethodsMixin
 * @demo demo/basic.html
 */
class AuthMethodBasic extends AuthMethodsMixin(EventsTargetMixin(PolymerElement)) {
  static get template() {
    return html`
    <style include="auth-methods-styles">
    :host {
      display: block;
      @apply --auth-method-panel;
      @apply --auth-method-basic;
    }
    </style>
    <auth-method-step step-start-index="[[stepStartIndex]]" step="1" no-steps="[[noSteps]]">
      <span slot="title">Set authorization data</span>
      <iron-form>
        <form autocomplete="on">
          <paper-input label="User name" value="{{username}}" name="username" type="text"
            required="" auto-validate="" autocomplete="on">
            <paper-icon-button slot="suffix" class="action-icon" on-click="clearUsername"
              icon="arc:clear" alt="Clear input icon" title="Clear input"></paper-icon-button>
          </paper-input>
          <paper-masked-input label="Password" name="password" value="{{password}}"
            autocomplete="on"></paper-masked-input>
        </form>
      </iron-form>
    </auth-method-step>
`;
  }

  static get is() {
    return 'auth-method-basic';
  }
  static get properties() {
    return {
      // base64 hash of the uid and passwd. When set it will override current username and password.
      hash: {
        type: String,
        notify: true
      },
      // The password.
      password: {
        type: String,
        notify: true
      },
      // The username.
      username: {
        type: String,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_hashChanged(hash)',
      '_userInputChanged(username, password)',
      '_settingsChanged(hash)'
    ];
  }

  constructor() {
    super();
    this._onAuthSettings = this._onAuthSettings.bind(this);
    this._headerChangedHandler = this._headerChangedHandler.bind(this);
  }

  _attachListeners(node) {
    node.addEventListener('auth-settings-changed', this._onAuthSettings);
    node.addEventListener('request-header-changed', this._headerChangedHandler);
  }

  _detachListeners(node) {
    node.removeEventListener('auth-settings-changed', this._onAuthSettings);
    node.removeEventListener('request-header-changed', this._headerChangedHandler);
  }
  /**
   * Resets state of the form.
   */
  reset() {
    this.set('hash', '');
    this.set('username', '');
    this.set('password', '');
  }
  /**
   * Validates the form.
   *
   * @return {Boolean} Validation result.
   */
  validate() {
    const form = this.shadowRoot.querySelector('iron-form');
    return form.validate();
  }
  /**
   * Dispatches `auth-settings-changed` custom event.
   */
  _settingsChanged() {
    if (!this.shadowRoot || this.__cancelChangeEvent) {
      return;
    }
    const e = this._notifySettingsChange('basic');
    this._notifyHeaderChange(e.detail.settings);
  }
  /**
   * Creates a settings object with user provided data.
   *
   * @return {Object} User provided data
   */
  getSettings() {
    return {
      hash: this.hash || '',
      password: this.password || '',
      username: this.username || ''
    };
  }
  /**
   * Restores settings from stored value.
   *
   * @param {Object} settings Object returned by `_getSettings()`
   */
  restore(settings) {
    if (settings.hash) {
      this.hash = settings.hash;
    } else {
      this.password = settings.password;
      this.username = settings.username;
    }
  }
  /**
   * Decodes hash value on change from the external source.
   *
   * @param {String} hash Hash value
   */
  _hashChanged(hash) {
    if (this._internalHashChange || !hash) {
      return;
    }
    try {
      const encoded = atob(hash);
      const parts = encoded.split(':');
      if (parts.length) {
        this._internalHashChange = true;
        this.username = parts[0];
        if (parts[1]) {
          this.password = parts[1];
        }
        this._internalHashChange = false;
      }
    } catch (e) {
      console.warn(e);
      this.dispatchEvent(new CustomEvent('error', {
        detail: {
          error: e
        },
        bubbles: false
      }));
    }
  }
  /**
   * Computes hash value for given username or password.
   * It computes value if at least one value for username and password is
   * provided. Otherwise it sets hash to empty string.
   *
   * @param {String} uid Username
   * @param {String} passwd Password
   * @return {String} Computed hash.
   */
  hashData(uid, passwd) {
    if (!uid) {
      uid = '';
    }
    if (!passwd) {
      passwd = '';
    }
    let hash;
    if (uid || passwd) {
      const enc = uid + ':' + passwd;
      hash = btoa(enc);
    } else {
      hash = '';
    }
    return hash;
  }
  /**
   * Sets the hash value for current username and password.
   *
   * @param {String} uid Username
   * @param {String} passwd Password
   */
  _userInputChanged(uid, passwd) {
    this._internalHashChange = true;
    this.set('hash', this.hashData(uid, passwd));
    this._internalHashChange = false;
  }
  /**
   * Clears username input.
   */
  clearUsername() {
    this.username = '';
  }

  /**
   * Handler to the `auth-settings-changed` event (fired by all auth panels).
   * If the event was fired by other element with the same method ttype
   * then the form will be updated to incomming values.
   * This helps to sync changes between elements in the same app.
   *
   * @param {Event} e
   */
  _onAuthSettings(e) {
    if (e.target === this || e.detail.type !== 'basic') {
      return;
    }
    this.__cancelChangeEvent = true;
    this.restore(e.detail.settings);
    this.__cancelChangeEvent = false;
  }
  /**
   * Handler for the `request-header-changed` custom event.
   * If the panel is opened the it checks if current header updates
   * authorization.
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
      if (this.hash) {
        this.reset();
      }
      return;
    }
    let lowerValue = value.toLowerCase();
    if (lowerValue.indexOf('basic') !== 0) {
      if (this.hash) {
        this.reset();
      }
      return;
    }
    value = value.substr(6);
    this.__cancelHeaderEvent = true;
    this.set('hash', value);
    this.__cancelHeaderEvent = false;
  }
  /**
   * Dispatches `request-header-changed` custom event to inform other
   * elements about authorization value change.
   *
   * @param {Object} settings
   */
  _notifyHeaderChange(settings) {
    if (this.__cancelHeaderEvent) {
      return;
    }
    const value = (settings && settings.hash) ? 'basic ' + settings.hash : 'Basic ';
    this.dispatchEvent(new CustomEvent('request-header-changed', {
      detail: {
        name: 'authorization',
        value: value
      },
      bubbles: true,
      composed: true
    }));
  }
  /**
   * Fired when error occured when decoding hash.
   * The event is not bubbling.
   *
   * @event error
   * @param {Error} error The error object.
   */
  /**
   * Fired when the any of the auth method settings has changed.
   * This event will be fired quite frequently - each time anything in the text field changed.
   * With one exception. This event will not be fired if the validation of the form didn't passed.
   *
   * @event auth-settings-changed
   * @param {Object} settings Current settings containing hash, password
   * and username.
   * @param {String} type The authorization type - basic
   * @param {Boolean} valid True if the form has been validated.
   */
  /**
   * Fired when the header value has changed.
   *
   * @event request-header-changed
   * @param {String} name Name of the header
   * @param {String} value Value of the header
   */
}
window.customElements.define(AuthMethodBasic.is, AuthMethodBasic);