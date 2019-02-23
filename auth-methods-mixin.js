/**
@license
Copyright 2018 The Advanced REST client authors
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
import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
/**
 * Contains a common properties and methods used in the Auth methods element set.
 *
 * Elements that implements this behavior may use `getSettings()` function to return an object
 * that will be passed to the `authorization-enabled` and `authorization-disabled` event.
 * Before sending this event it will try to collect settings data from this function. Whole object
 * will be passed to the event detail.
 *
 * @polymer
 * @mixinFunction
 */
export const AuthMethodsMixin = dedupingMixin((base) => {
  /**
   * @polymer
   * @mixinClass
   */
  class AMmixin extends base {
    static get properties() {
      return {
        /**
         * A start index for elements step counter.
         * Basic assumption is that this elements are used inside the
         * `authorization` panel which has the first step (auth type selector).
         * If the element is to be used as a standalone element then this
         * should be set to `0` (zero) so the number for the first step will be
         * `1`.
         * Basic and NTLM auth elements has only one step. Other elements, with
         * more complex structure has more steps.
         */
        stepStartIndex: {
          type: Number,
          value: 1
        },
        /**
         * If true then the auth method will not render progress bar (stepper).
         */
        noSteps: {
          type: Boolean,
          reflectToAttribute: true
        },
        /**
         * Setting passed to paper buttons.
         */
        noink: Boolean,
        /**
         * WHen set it prohibits methods from rendering inline documentation.
         */
        noDocs: {
          type: Boolean,
          value: false
        }
      };
    }
    /**
     * Gets a oauth type by the elemnt name.
     * Possible values: 'basic', 'ntlm', 'oauth1', 'oauth2', 'digest', 'custom'
     * or undefined.
     *
     * @return {String|undefined}
     */
    _getAuthType() {
      const name = this.nodeName.toLowerCase();
      switch (name) {
        case 'auth-method-basic':
          return 'basic';
        case 'auth-method-ntlm':
          return 'ntlm';
        case 'auth-method-oauth1':
          return 'oauth1';
        case 'auth-method-oauth2':
          return 'oauth2';
        case 'auth-method-digest':
          return 'digest';
      }
    }
    /**
     * Gathers data by calling `validate()` and `getSettings()` function and
     * dispatches `auth-settings-changed` custom event
     *
     * @param {String} type Auth form type.
     * @return {CustomEvent} Dispatched event
     */
    _notifySettingsChange(type) {
      const detail = {
        settings: this.getSettings(),
        type: type,
        valid: this.validate()
      };
      const e = new CustomEvent('auth-settings-changed', {
        detail: detail,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(e);
      return e;
    }
    /**
     * Computes value for conditions containg documentation block.
     * It always returns false if `noDocs` is true. Otherwise it returns
     * boolean value of the `value` argument
     *
     * @param {Boolean} noDocs Value of the `noDocs` property
     * @param {Boolean|String} value Docs value
     * @return {Boolean}
     */
    _computeHasDoc(noDocs, value) {
      if (noDocs) {
        return false;
      }
      return !!value;
    }
  }
  return AMmixin;
});