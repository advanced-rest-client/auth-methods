/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   auth-method-step.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-if.d.ts" />
/// <reference path="../paper-ripple/paper-ripple.d.ts" />
/// <reference path="../iron-collapse/iron-collapse.d.ts" />
/// <reference path="../arc-icons/arc-icons.d.ts" />
/// <reference path="../iron-icon/iron-icon.d.ts" />

declare namespace UiElements {

  /**
   * An element that renders authorization steps with title and content.
   */
  class AuthMethodStep extends Polymer.Element {

    /**
     * base64 hash of the uid and passwd. When set it will override current username and password.
     */
    stepStartIndex: number|null|undefined;
    step: number|null|undefined;

    /**
     * If true then the auth method will not render progress bar (stepper).
     */
    noSteps: boolean|null|undefined;

    /**
     * Title of the step
     */
    title: string|null|undefined;

    /**
     * If inactive it shows alternative summary content
     */
    inactive: boolean|null|undefined;
    _computeStep(stepStartIndex: any, currentStep: any): any;
    _inactiveTap(): void;
    _computeContentOpened(inactive: any, noSteps: any): any;
  }
}

interface HTMLElementTagNameMap {
  "auth-method-step": UiElements.AuthMethodStep;
}
