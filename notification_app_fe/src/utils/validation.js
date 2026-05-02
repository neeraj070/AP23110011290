const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[0-9+\-\s()]{7,15}$/;

export function cleanProfile(values) {
  return {
    email: values.email.trim(),
    name: values.name.trim(),
    mobileNo: values.mobileNo.trim(),
    githubUsername: values.githubUsername.trim(),
    rollNo: values.rollNo.trim(),
    accessCode: values.accessCode.trim(),
  };
}

export function validateSetupForm(values) {
  const cleaned = cleanProfile(values);
  const errors = {};

  if (!cleaned.email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(cleaned.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!cleaned.name) {
    errors.name = 'Name is required.';
  } else if (cleaned.name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!cleaned.mobileNo) {
    errors.mobileNo = 'Mobile number is required.';
  } else if (!MOBILE_PATTERN.test(cleaned.mobileNo)) {
    errors.mobileNo = 'Enter a valid mobile number.';
  }

  if (!cleaned.githubUsername) {
    errors.githubUsername = 'GitHub username is required.';
  }

  if (!cleaned.rollNo) {
    errors.rollNo = 'Roll number is required.';
  }

  if (!cleaned.accessCode) {
    errors.accessCode = 'Access code is required.';
  }

  return {
    values: cleaned,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
