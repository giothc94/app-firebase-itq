import { AbstractControl } from "@angular/forms";

export class CustomValidators {
  static confirmPassword(control: AbstractControl) {
    const password = control.get("password").value;
    const confirmPassword = control.get("confirmPassword").value;
    if (password === confirmPassword) {
      return null;
    }
    return {
      confirmPassword: true,
    };
  }
}
